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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const detectAds = async (url) => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  const detectedNetworks = new Set();
  let popupCount = 0;
  let popupPage = null;
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
    page.on('popup', (newPage) => {
      popupCount++;
      if (!popupPage) popupPage = newPage;
    });

    // Use 'load' so JS-rendered pages (YouTube, SPAs) actually paint content
    await page.goto(url, { waitUntil: 'load', timeout: 12000 });

    // Extra wait for JS hydration (SPAs need this to render above the fold)
    await sleep(1500);

    // Screenshot 1: initial load (now rendered)
    const shot1 = await page.screenshot({ type: 'jpeg', quality: 60 });

    const initialScriptCount = await page.evaluate(() =>
      document.querySelectorAll('script[src]').length
    );

    // Scroll to trigger lazy-loaded ads
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await sleep(1500);

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
      await sleep(1500);
    } catch { /* navigation on click is fine */ }

    // Screenshot 3: capture the popup page if one opened, otherwise the current page
    let shot3 = shot2;
    try {
      if (popupPage) {
        await popupPage.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
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
    // redirectCount removed — too many false positives (login redirects, CDN hops, regional redirects)
    const isAdIntensive =
      popupCount >= 1 ||
      adNetworks.length >= 2 ||
      adElementCount >= 3 ||
      dynamicScripts >= 3;

    return {
      isAdIntensive,
      popupCount,
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
    try { await browser.close(); } catch { /* ignore cleanup errors */ }
  }
};
