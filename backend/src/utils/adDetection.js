import { chromium } from 'playwright';

const AD_NETWORKS = [
  'googlesyndication', 'doubleclick', 'adnxs', 'taboola', 'outbrain',
  'amazon-adsystem', 'criteo', 'pubmatic', 'rubiconproject', 'openx', 'adzerk',
  'mgid', 'revcontent', 'sharethrough', 'media.net', 'adcolony', 'propellerads',
  'popcash', 'popads', 'trafficjunky', 'exoclick', 'juicyads',
];

const AD_SELECTORS = [
  'ins.adsbygoogle',
  'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',
  '[id*="google_ads"]',
  '[class*="advertisement"]',
  '[data-ad]',
  'iframe[id*="ad"]',
  'div[id*="banner"]',
  '[class*="popup"]',
  '[class*="overlay"]',
];

export const detectAds = async (url) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.setViewportSize({ width: 600, height: 900 });

    const detectedNetworks = new Set();
    let popupCount = 0;
    let redirectCount = 0;
    const originalHost = new URL(url).hostname;

    page.on('request', (req) => {
      const reqUrl = req.url();
      const matched = AD_NETWORKS.find((n) => reqUrl.includes(n));
      if (matched) detectedNetworks.add(matched);
    });

    // Track popup windows opened via window.open()
    context.on('page', () => { popupCount++; });

    // Track main-frame navigations away from the original domain
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        try {
          const navHost = new URL(frame.url()).hostname;
          if (navHost !== originalHost) redirectCount++;
        } catch { /* ignore */ }
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Screenshot 1: initial load
    const shot1 = await page.screenshot({ type: 'jpeg', quality: 60 });

    const initialScriptCount = await page.evaluate(() =>
      document.querySelectorAll('script[src]').length
    );

    // Scroll to mid-page to trigger lazy-loaded ads
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(2000);

    // Screenshot 2: after scroll
    const shot2 = await page.screenshot({ type: 'jpeg', quality: 60 });

    const afterScrollScripts = await page.evaluate(() =>
      document.querySelectorAll('script[src]').length
    );
    const dynamicScripts = Math.max(0, afterScrollScripts - initialScriptCount);

    // Find a clickable non-navigating element (button, div, role=button — NOT plain links)
    // to trigger click-activated ad scripts / popups without navigating the page away
    const clickTarget = await page.evaluate(() => {
      const candidates = [
        ...document.querySelectorAll('button, [role="button"], div[onclick], span[onclick]'),
      ].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 10 && r.height > 10 && r.top > 80 && r.top < window.innerHeight - 80;
      });
      if (candidates[0]) {
        const r = candidates[0].getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    });

    // Click the target (or a safe fallback coordinate), then grab screenshot regardless
    try {
      if (clickTarget) {
        await page.mouse.click(clickTarget.x, clickTarget.y);
      } else {
        await page.mouse.click(300, 450);
      }
      await page.waitForTimeout(2000);
    } catch { /* page may have navigated — that itself counts as a redirect */ }

    // Screenshot 3: capture current state (may be a redirected page)
    let shot3;
    try {
      shot3 = await page.screenshot({ type: 'jpeg', quality: 60 });
    } catch {
      shot3 = shot2; // fallback to scroll screenshot if page is gone
    }

    let adElementCount = 0;
    try {
      adElementCount = await page.evaluate((selectors) =>
        selectors.reduce((n, s) => n + document.querySelectorAll(s).length, 0),
        AD_SELECTORS
      );
    } catch { /* page navigated, skip element count */ }

    const adNetworks = [...detectedNetworks];
    const isAdIntensive =
      popupCount >= 1 ||
      redirectCount >= 1 ||
      adNetworks.length >= 2 ||
      adElementCount >= 3 ||
      dynamicScripts >= 3;

    return {
      isAdIntensive,
      popupCount,
      redirectCount,
      adNetworks,
      adElementCount,
      dynamicScripts,
      screenshots: [
        shot1.toString('base64'),
        shot2.toString('base64'),
        shot3.toString('base64'),
      ],
    };
  } catch (err) {
    console.error('Ad detection error:', err.message);
    return null;
  } finally {
    await browser.close();
  }
};
