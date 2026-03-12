import { chromium } from 'playwright';

export const extractScriptsFromURL = async (url) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const scripts = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('script:not([src])').forEach(s => {
        if (s.innerHTML.trim()) results.push({ type: 'inline', content: s.innerHTML.trim() });
      });
      document.querySelectorAll('script[src]').forEach(s => {
        results.push({ type: 'external', src: s.src });
      });
      return results;
    });

    return scripts;
  } catch (error) {
    // return empty scripts instead of crashing if URL can't be loaded
    console.log('Playwright warning:', error.message);
    return [];
  } finally {
    await browser.close();
  }
};