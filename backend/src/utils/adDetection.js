import { chromium } from 'playwright';

const AD_NETWORKS = [
  'googlesyndication', 'doubleclick', 'adnxs', 'taboola', 'outbrain',
  'amazon-adsystem', 'criteo', 'pubmatic', 'rubiconproject', 'openx', 'adzerk',
];

const AD_SELECTORS = [
  'ins.adsbygoogle',
  'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',
  '[id*="google_ads"]',
  '[class*="advertisement"]',
  '[data-ad]',
];

export const detectAds = async (url) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: 600, height: 900 });

    const detectedNetworks = new Set();
    page.on('request', (req) => {
      const reqUrl = req.url();
      const matched = AD_NETWORKS.find((n) => reqUrl.includes(n));
      if (matched) detectedNetworks.add(matched);
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

    // Simulate a click to trigger any click-activated ad scripts
    await page.mouse.click(300, 400);
    await page.waitForTimeout(1500);

    // Screenshot 3: after click
    const shot3 = await page.screenshot({ type: 'jpeg', quality: 60 });

    const adElementCount = await page.evaluate((selectors) =>
      selectors.reduce((n, s) => n + document.querySelectorAll(s).length, 0),
      AD_SELECTORS
    );

    const adNetworks = [...detectedNetworks];
    const isAdIntensive = adNetworks.length >= 2 || adElementCount >= 3 || dynamicScripts >= 3;

    return {
      isAdIntensive,
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
