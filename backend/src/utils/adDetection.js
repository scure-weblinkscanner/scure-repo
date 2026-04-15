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
  const page = await browser.newPage();

  const detectedNetworks = new Set();
  let popupCount = 0;
  let redirectCount = 0;
  const originalHost = new URL(url).hostname;

  try {
    await page.setViewportSize({ width: 600, height: 900 });

    // Track ad network requests
    page.on('request', (req) => {
      const reqUrl = req.url();
      const matched = AD_NETWORKS.find((n) => reqUrl.includes(n));
      if (matched) detectedNetworks.add(matched);
    });

    // Detect window.open() popups and capture the first one
    let popupPage = null;
    page.on('popup', (newPage) => {
      popupCount++;
      if (!popupPage) popupPage = newPage;
    });;

    // Detect main-frame navigations away from original domain after load
    let pageLoaded = false;
    page.on('framenavigated', (frame) => {
      if (!pageLoaded || frame !== page.mainFrame()) return;
      try {
        const navHost = new URL(frame.url()).hostname;
        if (navHost !== originalHost) redirectCount++;
      } catch { /* ignore */ }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    pageLoaded = true;

    // Screenshot 1: initial load
    const shot1 = await page.screenshot({ type: 'jpeg', quality: 60 });

    const initialScriptCount = await page.evaluate(() =>
      document.querySelectorAll('script[src]').length
    );

    // Scroll to trigger lazy-loaded ads
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(2000);

    // Screenshot 2: after scroll
    const shot2 = await page.screenshot({ type: 'jpeg', quality: 60 });

    const afterScrollScripts = await page.evaluate(() =>
      document.querySelectorAll('script[src]').length
    );
    const dynamicScripts = Math.max(0, afterScrollScripts - initialScriptCount);

    // Click a non-link interactive element to trigger click-activated popups
    // Deliberately exclude <a href> to avoid navigating the page away
    const clickTarget = await page.evaluate(() => {
      const els = [...document.querySelectorAll('button, [role="button"], div[onclick], span[onclick]')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 10 && r.height > 10 && r.top > 80 && r.top < window.innerHeight - 80;
        });
      if (els[0]) {
        const r = els[0].getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    });

    try {
      await page.mouse.click(clickTarget?.x ?? 300, clickTarget?.y ?? 450);
      await page.waitForTimeout(2000);
    } catch { /* navigation on click is fine — redirectCount will capture it */ }

    // Screenshot 3: capture the popup page if one opened, otherwise the current page
    let shot3 = shot2;
    try {
      if (popupPage) {
        await popupPage.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
        shot3 = await popupPage.screenshot({ type: 'jpeg', quality: 60 });
      } else {
        shot3 = await page.screenshot({ type: 'jpeg', quality: 60 });
      }
    } catch { /* use shot2 as fallback */ }

    let adElementCount = 0;
    try {
      adElementCount = await page.evaluate(
        (selectors) => selectors.reduce((n, s) => n + document.querySelectorAll(s).length, 0),
        AD_SELECTORS
      );
    } catch { /* page may have navigated */ }

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
