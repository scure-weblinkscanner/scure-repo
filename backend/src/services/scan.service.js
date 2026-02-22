import { extractScriptsFromURL } from '../utils/playwright.js';
import { analyzeScripts, generateSuggestion } from '../utils/geminiAnalysis.js';
import { scanWithURLScan } from '../utils/urlScan.js';
import { scanWithVirusTotal } from '../utils/virusTotal.js';
import { scanWithSafeBrowsing } from '../utils/safeBrowsing.js';

export const analyzeURL = async (url) => {
  const [scripts, urlscan, virustotal, safebrowsing] = await Promise.all([
    extractScriptsFromURL(url),
    scanWithURLScan(url),
    scanWithVirusTotal(url),
    scanWithSafeBrowsing(url),
  ]);

  const scriptAnalysis = await analyzeScripts(scripts, url);

  // collect who flagged it as malicious
  const flaggedBy = [];
  if (scriptAnalysis.verdict === 'malicious') flaggedBy.push('AI Script Analysis');
  if (virustotal.verdict === 'malicious') flaggedBy.push('VirusTotal');
  if (safebrowsing.verdict === 'malicious') flaggedBy.push('Google Safe Browsing');
  if (urlscan.verdict === 'malicious') flaggedBy.push('URLScan.io');

  // calculate risk score
  let riskScore = scriptAnalysis.riskScore || 0;
  if (virustotal.malicious > 0) riskScore += 30;
  if (safebrowsing.verdict === 'malicious') riskScore += 30;
  if (urlscan.verdict === 'malicious') riskScore += 20;
  riskScore = Math.min(riskScore, 100);

  // overall verdict
  const safebrowsingMalicious = safebrowsing.verdict === 'malicious';
  const overallVerdict = safebrowsingMalicious || riskScore >= 60
    ? 'malicious'
    : riskScore >= 25
    ? 'suspicious'
    : 'clean';

  // human readable score label
  const scoreLabel = riskScore >= 60
    ? 'High risk'
    : riskScore >= 25
    ? 'Moderate risk'
    : 'Mostly clean';

  // suggestion from AI or fallback
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
  };
};