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

    // Track ad network requests
    page.on('request', (req) => {
      const reqUrl = req.url();
      const matched = AD_NETWORKS.find((n) => reqUrl.includes(n));
      if (matched) detectedNetworks.add(matched);
    });

    // Track popup windows (window.open calls) — key indicator for streaming/piracy sites
    context.on('page', () => { popupCount++; });

    // Track unexpected navigations away from original domain after interaction
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        try {
          const navHost = new URL(frame.url()).hostname;
          if (navHost !== originalHost && frame.url() !== url) redirectCount++;
        } catch { /* ignore invalid URLs */ }
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

    // Click on a likely interactive element to trigger click-activated ads/popups
    const clicked = await page.evaluate(() => {
      const candidates = [
        ...document.querySelectorAll('a[href], button, [role="button"], .play-btn, .watch-btn'),
      ].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.top > 100 && r.top < window.innerHeight;
      });
      if (candidates[0]) {
        const r = candidates[0].getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    });

    if (clicked) {
      await page.mouse.click(clicked.x, clicked.y);
    } else {
      await page.mouse.click(300, 450);
    }
    await page.waitForTimeout(2000);

    // Screenshot 3: after click
    const shot3 = await page.screenshot({ type: 'jpeg', quality: 60 });

    const adElementCount = await page.evaluate((selectors) =>
      selectors.reduce((n, s) => n + document.querySelectorAll(s).length, 0),
      AD_SELECTORS
    );

    const adNetworks = [...detectedNetworks];

    // isAdIntensive: any popup/redirect is an immediate flag;
    // otherwise check ad networks, elements, dynamic scripts
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
    console.log('Ad detection warning:', err.message);
    return null;
  } finally {
    await browser.close();
  }
};
