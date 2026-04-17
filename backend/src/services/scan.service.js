import { extractScriptsFromURL, extractLinksFromURL, extractTextContentFromURL } from '../utils/playwright.js';
import { analyzeScripts, generateSuggestion, analyzeForMisinformation } from '../utils/geminiAnalysis.js';
import { scanWithURLScan } from '../utils/urlScan.js';
import { scanWithVirusTotal } from '../utils/virusTotal.js';
import { scanWithSafeBrowsing } from '../utils/safeBrowsing.js';
import { checkBlocklist } from './blocklist.service.js';
import { detectAds } from '../utils/adDetection.js';

export const analyzeURL = async (url, isPremium = false, adDetection = false, skipBlocklist = false) => {
  // ── Fast local blocklist check (premium users only) ──
  if (isPremium && !skipBlocklist) {
    const blocklistHit = await checkBlocklist(url);
    if (blocklistHit) {
      return {
        url,
        overallVerdict: 'malicious',
        riskScore: 100,
        scoreLabel: 'High risk',
        flaggedBy: [`${blocklistHit.blSource} Blocklist`],
        suggestion: 'This URL is on our blocklist and is known to be malicious. Do not visit it.',
        blocklist: {
          source: blocklistHit.blSource,
          threatType: blocklistHit.blThreatType,
          addedAt: blocklistHit.blAddedAt,
        },
        scriptAnalysis: { verdict: 'malicious', riskScore: 100, findings: [] },
        urlscan: { verdict: 'malicious', score: 0, categories: [], screenshot: null, uuid: null },
        virustotal: { verdict: 'malicious', malicious: 0, suspicious: 0, harmless: 0 },
        safebrowsing: { verdict: 'malicious', threats: [] },
        embeddedLinks: [],
      };
    }
  }

  // ── Full external API scan ────────────────────────────────────
  const [scripts, embeddedLinks, urlscanResult, virustotal, safebrowsing, adAnalysis] = await Promise.all([
    extractScriptsFromURL(url),
    extractLinksFromURL(url),
    scanWithURLScan(url).catch((err) => {
      console.warn('URLScan skipped:', err.message);
      return { verdict: 'unknown', score: 0, categories: [], screenshot: null, uuid: null };
    }),
    scanWithVirusTotal(url),
    scanWithSafeBrowsing(url),
    (isPremium && adDetection)
      ? Promise.race([
          detectAds(url),
          new Promise((resolve) => setTimeout(() => resolve(null), 60000)),
        ]).catch(() => null)
      : Promise.resolve(null),
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

  const anyEmbeddedMalicious = embeddedLinkResults.some((r) => r.verdict === 'malicious');

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

  const { text: suggestion, _source: suggestionSource } = await generateSuggestion(riskScore, flaggedBy, scoreLabel, url);

  return {
    url,
    overallVerdict,
    riskScore,
    scoreLabel,
    flaggedBy,
    suggestion,
    suggestionSource,
    scriptAnalysis,
    urlscan,
    virustotal,
    safebrowsing,
    embeddedLinks: embeddedLinkResults,
    adAnalysis,
  };
};

export const factCheckURL = async (url) => {
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
