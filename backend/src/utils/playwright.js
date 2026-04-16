import { chromium } from 'playwright';

const LAUNCH_ARGS = {
  headless: true,
  args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
};

export const extractScriptsFromURL = async (url) => {
  const browser = await chromium.launch(LAUNCH_ARGS);
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
    console.log('Playwright warning:', error.message);
    return [];
  } finally {
    await browser.close();
  }
};

export const extractLinksFromURL = async (url) => {
  const browser = await chromium.launch(LAUNCH_ARGS);
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const links = await page.evaluate(() => {
      const seen = new Set();
      const results = [];
      document.querySelectorAll('a[href]').forEach((a) => {
        const href = a.href;
        if (href && href.startsWith('http') && !seen.has(href)) {
          seen.add(href);
          results.push(href);
        }
      });
      return results.slice(0, 50);
    });

    return links;
  } catch (error) {
    console.log('Link extraction warning:', error.message);
    return [];
  } finally {
    await browser.close();
  }
};