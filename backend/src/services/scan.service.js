import { extractScriptsFromURL, extractLinksFromURL, extractTextContentFromURL } from '../utils/playwright.js';
import { analyzeScripts, generateSuggestion, analyzeForMisinformation } from '../utils/geminiAnalysis.js';
import { scanWithURLScan } from '../utils/urlScan.js';
import { scanWithVirusTotal } from '../utils/virusTotal.js';
import { scanWithSafeBrowsing } from '../utils/safeBrowsing.js';

export const analyzeURL = async (url) => {
  const [scripts, embeddedLinks, urlscanResult, virustotal, safebrowsing] = await Promise.all([
    extractScriptsFromURL(url),
    extractLinksFromURL(url),
    scanWithURLScan(url).catch((err) => {
      console.warn('URLScan skipped:', err.message);
      return { verdict: 'unknown', score: 0, categories: [], screenshot: null, uuid: null };
    }),
    scanWithVirusTotal(url),
    scanWithSafeBrowsing(url),
  ]);

  const urlscan = urlscanResult;
  const scriptAnalysis = await analyzeScripts(scripts, url);

  const embeddedLinkResults = await Promise.all(
    embeddedLinks.map(async (link) => {
      try {
        const result = await scanWithSafeBrowsing(link);
        return { url: link, verdict: result.verdict };
      } catch {
        return { url: link, verdict: 'unknown' };
      }
    })
  );

  const anyEmbeddedMalicious = embeddedLinkResults.some(
    (r) => r.verdict === 'malicious'
  );

  const flaggedBy = [];
  if (scriptAnalysis.verdict === 'malicious') flaggedBy.push('AI Script Analysis');
  if (virustotal.verdict === 'malicious') flaggedBy.push('VirusTotal');
  if (safebrowsing.verdict === 'malicious') flaggedBy.push('Google Safe Browsing');
  if (urlscan.verdict === 'malicious') flaggedBy.push('URLScan.io');
  if (anyEmbeddedMalicious) flaggedBy.push('Embedded Links');

  let riskScore = scriptAnalysis.riskScore || 0;
  if (virustotal.malicious > 0) riskScore += 30;
  if (safebrowsing.verdict === 'malicious') riskScore += 30;
  if (urlscan.verdict === 'malicious') riskScore += 20;
  if (anyEmbeddedMalicious) riskScore += 20;
  riskScore = Math.min(riskScore, 100);

  const safebrowsingMalicious = safebrowsing.verdict === 'malicious';
  const overallVerdict = safebrowsingMalicious || anyEmbeddedMalicious || riskScore >= 60
    ? 'malicious'
    : riskScore >= 25
    ? 'suspicious'
    : 'clean';

  const scoreLabel = riskScore >= 60
    ? 'High risk'
    : riskScore >= 25
    ? 'Moderate risk'
    : 'Mostly clean';

  const suggestion = await generateSuggestion(riskScore, flaggedBy, scoreLabel, url);

  return {
    url,
    overallVerdict,
    riskScore,
    scoreLabel,
    flaggedBy,
    suggestion,
    scriptAnalysis,
    urlscan,
    virustotal,
    safebrowsing,
    embeddedLinks: embeddedLinkResults,
  };
};

export const factCheckURL = async (url) => {
  // Extract visible page text for Gemini to analyse
  const textContent = await extractTextContentFromURL(url).catch((err) => {
    console.warn('Text extraction skipped:', err.message);
    return '';
  });

  const analysis = await analyzeForMisinformation(url, textContent);

  return {
    url,
    ...analysis,
  };
};