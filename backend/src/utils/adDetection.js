import { chromium } from 'playwright';

const AD_NETWORKS = [
  // Google
  'googlesyndication', 'doubleclick', 'googletagmanager', 'googletagservices',
  'googletag', 'google-analytics', 'googleadservices', 'pagead2.googlesyndication',
  // Programmatic / exchanges
  'adnxs', 'appnexus', 'pubmatic', 'rubiconproject', 'openx', 'adzerk',
  'casalemedia', 'contextweb', 'indexww', 'spotxchange', 'smartadserver',
  'lijit', 'yieldmo', 'emxdgt', '33across', 'triplelift', 'sharethrough',
  'sovrn', 'undertone', 'rhythmone', 'bidswitch',
  // Native / content ads
  'taboola', 'outbrain', 'mgid', 'revcontent', 'content.ad', 'zergnet',
  // Affiliate / performance
  'criteo', 'media.net', 'amazon-adsystem', 'amzn.to',
  // Adult / aggressive
  'trafficjunky', 'exoclick', 'juicyads', 'trafficstars', 'adcash',
  'propellerads', 'popcash', 'popads', 'hilltopads', 'adsterra',
  // Other
  'adcolony', 'moatads', 'adsafeprotected', 'sizmek', 'flashtalking',
  'advertising.com', 'yieldlove', 'prebid', 'confiant',
];

const AD_SELECTORS = [
  // Google ads
  'ins.adsbygoogle',
  '[data-ad-client]', '[data-ad-slot]', '[data-ad-format]',
  'iframe[src*="googlesyndication"]', 'iframe[src*="doubleclick"]',
  'iframe[src*="googletagservices"]',
  // Generic ad patterns
  '[id*="google_ads"]', '[id*="div-gpt-ad"]', '[id*="ad-slot"]',
  '[class*="advertisement"]', '[class*="ad-container"]', '[class*="ad-wrapper"]',
  '[class*="adunit"]', '[class*="adsbygoogle"]',
  '[data-ad]', '[data-advertisement]',
  // Popups / overlays
  '[class*="popup"]', '[class*="pop-up"]', '[class*="overlay"]',
  '[class*="interstitial"]', '[class*="takeover"]',
  // Banners
  '[id*="banner"]', '[class*="banner-ad"]', '[class*="leaderboard"]',
  // Sticky
  '[class*="sticky-ad"]', '[class*="fixed-ad"]',
  // iframes likely used for ads
  'iframe[id*="ad"]', 'iframe[class*="ad"]',
];

// JS globals injected by ad/analytics libraries
const AD_GLOBALS = [
  'googletag',      // Google Publisher Tag (DFP)
  'adsbygoogle',    // AdSense
  'pbjs',           // Prebid.js
  '__cmp',          // IAB Consent Management Platform
  '__tcfapi',       // TCF v2 (GDPR consent)
  '_pq',            // PageQuant
  'ADTECH',         // AOL AdTech
  'AdButler',
  'Criteo',
  'TaboolaFeed',
  'outbrain',
  '_taboola',
  '_mgq',           // MGID
  'revcontentIframe',
  'propeller',
  'adthrive',
  'mediavine',      // Premium ad network - very ad-heavy
  'ramp',           // RampJS
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const LAUNCH_ARGS = [
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-blink-features=AutomationControlled',
];

export const detectAds = async (url) => {
  const browser = await chromium.launch({ headless: true, args: LAUNCH_ARGS });
  const page = await browser.newPage();

  const detectedNetworks = new Set();
  let popupCount = 0;
  let popupPage = null;

  try {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Track ad network requests
    page.on('request', (req) => {
      const reqUrl = req.url().toLowerCase();
      for (const n of AD_NETWORKS) {
        if (reqUrl.includes(n)) { detectedNetworks.add(n); break; }
      }
    });

    // Detect window.open() popups
    page.on('popup', (newPage) => {
      popupCount++;
      if (!popupPage) popupPage = newPage;
    });

    await page.goto(url, { waitUntil: 'load', timeout: 15000 });

    // Longer wait for JS-heavy pages and lazy ad loaders
    await sleep(5000);

    // Screenshot 1: initial load
    const shot1 = await page.screenshot({ type: 'jpeg', quality: 60 });

    const initialScriptCount = await page.evaluate(() =>
      document.querySelectorAll('script[src]').length
    );

    // ── Incremental scroll: 25% → 50% → 75% → 100% with mouse movement ──
    const scrollSteps = [0.25, 0.5, 0.75, 1.0];
    for (const fraction of scrollSteps) {
      try {
        await page.evaluate((f) => window.scrollTo({ top: document.body.scrollHeight * f, behavior: 'smooth' }), fraction);
        await sleep(1000);
        await page.mouse.move(128, 240); await sleep(80);
        await page.mouse.move(640, 400); await sleep(80);
        await page.mouse.move(1152, 560); await sleep(80);
      } catch { /* page may have navigated — continue */ }
    }

    // ── Scroll back to top to trigger sticky/on-scroll-up ad units ──
    try {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await sleep(1000);
    } catch { /* ignore */ }

    // ── Hover over large images to trigger mouseover-activated ad units ──
    try {
      const imageCenters = await page.evaluate(() =>
        [...document.querySelectorAll('img')]
          .map((img) => {
            const r = img.getBoundingClientRect();
            return r.width > 100 && r.height > 50 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
          })
          .filter(Boolean)
          .slice(0, 5)
      );
      for (const pt of imageCenters) {
        try { await page.mouse.move(pt.x, pt.y); await sleep(200); } catch { /* ignore */ }
      }
    } catch { /* page navigated or evaluate failed */ }

    // Screenshot 2: after full scroll pass
    const shot2 = await page.screenshot({ type: 'jpeg', quality: 60 }).catch(() => shot1);

    const afterScrollScripts = await page.evaluate(() =>
      document.querySelectorAll('script[src]').length
    ).catch(() => initialScriptCount);
    const dynamicScripts = Math.max(0, afterScrollScripts - initialScriptCount);

    // ── Multiple clicks across different vertical zones ──
    try {
      const clickTargets = await page.evaluate(() => {
        const zones = [
          [80, window.innerHeight * 0.25],
          [window.innerHeight * 0.25, window.innerHeight * 0.5],
          [window.innerHeight * 0.5, window.innerHeight * 0.75],
          [window.innerHeight * 0.75, window.innerHeight - 80],
        ];
        const results = [];
        for (const [minY, maxY] of zones) {
          const el = [...document.querySelectorAll('button, [role="button"], div[onclick], span[onclick]')]
            .find((e) => {
              const r = e.getBoundingClientRect();
              return r.width > 10 && r.height > 10 && r.top >= minY && r.top < maxY;
            });
          if (el) {
            const r = el.getBoundingClientRect();
            results.push({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
          }
        }
        return results.slice(0, 5);
      });

      for (const target of clickTargets) {
        try { await page.mouse.click(target.x, target.y); await sleep(800); } catch { /* navigation ok */ }
      }
      if (clickTargets.length === 0) {
        try { await page.mouse.click(300, 450); await sleep(800); } catch { /* ignore */ }
      }
    } catch { /* evaluate failed — page navigated */ }

    // ── Mobile viewport pass ──
    try {
      await page.setViewportSize({ width: 375, height: 812 });
      await sleep(1000);
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.5, behavior: 'smooth' }));
      await sleep(1500);
      await page.setViewportSize({ width: 1280, height: 800 });
      await sleep(500);
    } catch { /* ignore viewport errors */ }

    // Screenshot 3: capture popup or current state
    let shot3 = shot2;
    try {
      if (popupPage) {
        await popupPage.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
        shot3 = await popupPage.screenshot({ type: 'jpeg', quality: 60 });
      } else {
        shot3 = await page.screenshot({ type: 'jpeg', quality: 60 });
      }
    } catch { /* use shot2 as fallback */ }

    // ── Collect all signals ──────────────────────────────────
    const signals = await page.evaluate(
      ({ selectors, globals }) => {
        const adElementCount = selectors.reduce(
          (n, s) => { try { return n + document.querySelectorAll(s).length; } catch { return n; } }, 0
        );

        const iframeCount = document.querySelectorAll('iframe').length;

        // Fixed/sticky elements that look like ad bars
        const stickyAdCount = [...document.querySelectorAll('*')].filter((el) => {
          const s = window.getComputedStyle(el);
          if (s.position !== 'fixed' && s.position !== 'sticky') return false;
          const r = el.getBoundingClientRect();
          // Wide banner-like fixed elements
          return r.width > window.innerWidth * 0.5 && r.height > 30 && r.height < 250;
        }).length;

        // Auto-playing media (without muted doesn't count, but with muted + autoplay is suspicious)
        const autoplayMedia = document.querySelectorAll('video[autoplay], audio[autoplay]').length;

        // Detected JS globals
        const presentGlobals = globals.filter((g) => window[g] !== undefined);

        // Large images likely to be display ads (300x250, 728x90, 160x600, etc.)
        const adSizedImages = [...document.querySelectorAll('img')].filter((img) => {
          const { width, height } = img.getBoundingClientRect();
          return (
            (Math.abs(width - 300) < 20 && Math.abs(height - 250) < 20) || // medium rectangle
            (Math.abs(width - 728) < 30 && Math.abs(height - 90) < 20)  || // leaderboard
            (Math.abs(width - 160) < 20 && Math.abs(height - 600) < 30) || // wide skyscraper
            (Math.abs(width - 320) < 20 && Math.abs(height - 50) < 15)     // mobile banner
          );
        }).length;

        return { adElementCount, iframeCount, stickyAdCount, autoplayMedia, presentGlobals, adSizedImages };
      },
      { selectors: AD_SELECTORS, globals: AD_GLOBALS }
    ).catch(() => ({
      adElementCount: 0, iframeCount: 0, stickyAdCount: 0,
      autoplayMedia: 0, presentGlobals: [], adSizedImages: 0,
    }));

    // Navigate back to original page if we drifted due to a click
    try {
      if (new URL(page.url()).hostname !== new URL(url).hostname) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
        await sleep(1000);
      }
    } catch { /* ignore — best effort */ }

    const adNetworks = [...detectedNetworks];

    // ── Scoring ─────────────────────────────────────────────
    let score = 0;
    if (popupCount >= 1)               score += 4;               // popup = strong signal
    score += Math.min(adNetworks.length * 1.5, 6);               // each network (capped at 4 networks)
    score += Math.min(Math.floor(signals.adElementCount / 2), 4); // ad elements
    if (dynamicScripts >= 3)           score += 2;
    if (signals.iframeCount >= 4)      score += Math.min(Math.floor(signals.iframeCount / 4), 3);
    score += Math.min(signals.presentGlobals.length * 1.5, 5);   // ad JS globals
    if (signals.stickyAdCount >= 1)    score += signals.stickyAdCount;
    if (signals.autoplayMedia >= 1)    score += 1;
    if (signals.adSizedImages >= 2)    score += Math.min(signals.adSizedImages, 3);

    const isAdIntensive = score >= 4;

    return {
      isAdIntensive,
      score: Math.round(score),
      popupCount,
      adNetworks,
      adElementCount: signals.adElementCount,
      dynamicScripts,
      iframeCount: signals.iframeCount,
      adGlobals: signals.presentGlobals,
      screenshots: [
        shot1.toString('base64'),
        shot2.toString('base64'),
        shot3.toString('base64'),
      ],
    };
  } catch (err) {
    console.error('Ad detection error:', err.message);
    return { failed: true, isAdIntensive: false, score: 0, adNetworks: [], adElementCount: 0, dynamicScripts: 0, iframeCount: 0, adGlobals: [], screenshots: [], popupCount: 0 };
  } finally {
    try { await browser.close(); } catch { /* ignore */ }
  }
};
