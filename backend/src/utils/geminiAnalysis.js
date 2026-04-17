import { GoogleGenerativeAI } from '@google/generative-ai';
import { callGroq } from './groq.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' });

export const analyzeScripts = async (scripts, url) => {
  if (!scripts || scripts.length === 0) {
    return { verdict: 'clean', reason: 'No scripts found on page.', riskScore: 0 };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const inlineScripts = scripts
    .filter(s => s.type === 'inline')
    .map(s => s.content)
    .join('\n\n---\n\n')
    .slice(0, 10000);

  const externalSrcs = scripts
    .filter(s => s.type === 'external')
    .map(s => s.src)
    .join('\n');

  const prompt = `
You are a cybersecurity expert analyzing website scripts for malicious behavior.

URL being analyzed: ${url}

External script sources:
${externalSrcs || 'None'}

Inline scripts:
${inlineScripts || 'None'}

Analyze these scripts and respond in JSON format only, no markdown:
{
  "verdict": "malicious" | "suspicious" | "clean",
  "riskScore": 0-100,
  "reason": "detailed explanation of findings (2-3 sentences covering what was found and why it is or isn't a concern)",
  "indicators": ["specific suspicious patterns or script sources found, or empty if clean"]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return { ...JSON.parse(text), _source: 'gemini' };
  } catch {
    try {
      const text = (await callGroq(prompt)).replace(/```json|```/g, '').trim();
      return { ...JSON.parse(text), _source: 'groq' };
    } catch {
      return { verdict: 'unknown', reason: 'AI analysis unavailable.', riskScore: 0, indicators: [], _source: 'none' };
    }
  }
};

export const generateSuggestion = async (riskScore, flaggedBy, scoreLabel, url) => {
  const prompt = `
You are a cybersecurity assistant giving advice to a regular user about a URL they want to visit.

URL: ${url}
Risk Score: ${riskScore}/100
Risk Level: ${scoreLabel}
Flagged as malicious by: ${flaggedBy.length > 0 ? flaggedBy.join(', ') : 'None'}

No need for greetings. Give a short, clear, friendly safety suggestion (2-3 sentences max) for this user.
Do not use technical jargon. Be direct about whether they should visit the URL or not.
Do not use first-person language (no "I would", "I advise", "I recommend", etc.) — write as a professional security tool, not as a person.
Respond with plain text only, no JSON, no markdown.
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    return { text: result.response.text().trim(), _source: 'gemini' };
  } catch {
    try {
      return { text: (await callGroq(prompt)).trim(), _source: 'groq' };
    } catch {
      let text;
      if (riskScore >= 60 || flaggedBy.length > 0) {
        const flagText = flaggedBy.length > 0 ? ` Flagged by: ${flaggedBy.join(', ')}.` : '';
        text = `This URL appears risky (${scoreLabel}).${flagText} We recommend avoiding it.`;
      } else if (riskScore >= 25) {
        text = `This URL shows some suspicious signals (${scoreLabel}). Proceed with caution and only visit if you trust the source.`;
      } else {
        text = 'No significant threats detected. Looks safe to proceed.';
      }
      return { text, _source: 'none' };
    }
  }
};

// ── Misinformation / fact-check analysis ──
export const analyzeForMisinformation = async (url, textContent) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const truncated = textContent?.slice(0, 15000) || '';
  const today = new Date().toDateString(); // e.g. "Fri Apr 17 2026"

  const prompt = `
You are a balanced, professional fact-checker. Your job is to assess whether the content of a webpage contains clear misinformation, not to be overly critical of legitimate news.

Today's date: ${today}
URL being analysed: ${url}

Important guidelines:
- Today is ${today}. Any dates on or before today are NOT future dates. Do not flag current-year news as impossible or anachronistic.
- Consider the source domain. Established news organisations (e.g. straitstimes.com, bbc.com, reuters.com, cnn.com, nytimes.com) have editorial standards and should be given appropriate credibility unless the content itself contains clear, specific factual errors.
- News homepages show many headlines without full article context. Do not mark a headline as "false" just because you cannot independently verify it — use "unverified" instead.
- Only mark something "misleading" or "false" if there is a clear, specific factual error or deliberate manipulation — not simply because you are uncertain.
- A verdict of "trustworthy" is correct for reputable sources with no clear errors found.
- Keep confidenceScore realistic — avoid extremes (0 or 100) unless the evidence is overwhelming.

Page Content:
${truncated || 'Content could not be extracted — base your analysis on the URL and domain alone.'}

Respond in JSON format only, no markdown:
{
  "verdict": "trustworthy" | "questionable" | "misleading",
  "confidenceScore": 0-100,
  "summary": "2-3 sentence balanced assessment of the content reliability",
  "claims": [
    {
      "claim": "a specific claim found in the content (max 5 most notable)",
      "verdict": "true" | "false" | "unverified" | "misleading",
      "explanation": "brief, fair explanation"
    }
  ],
  "redFlags": ["only include genuine credibility concerns, not speculative ones"],
  "positiveIndicators": ["credibility signals or trustworthy signs found"]
}
`;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text();

      const stripped = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const jsonMatch = stripped.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : stripped;

      try {
        return { ...JSON.parse(jsonStr), _source: 'gemini' };
      } catch {
        return {
          verdict: 'questionable', confidenceScore: 50,
          summary: 'Analysis could not be fully completed. Review the content manually.',
          claims: [], redFlags: [], positiveIndicators: [], _source: 'gemini',
        };
      }
    } catch (error) {
      const isOverload = error.message?.includes('503') || error.message?.includes('high demand');
      console.error(`Misinformation analysis error (attempt ${attempt}/${maxRetries}):`, error.message);

      if (isOverload && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
        continue;
      }

      try {
        const raw = await callGroq(prompt);
        const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const jsonMatch = stripped.match(/\{[\s\S]*\}/);
        return { ...JSON.parse(jsonMatch ? jsonMatch[0] : stripped), _source: 'groq' };
      } catch {
        return {
          verdict: 'questionable', confidenceScore: 50,
          summary: 'AI analysis is temporarily unavailable. Please try again later.',
          claims: [], redFlags: [], positiveIndicators: [], _source: 'none',
        };
      }
    }
  }
};