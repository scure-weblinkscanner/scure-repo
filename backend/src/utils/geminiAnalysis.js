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
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const truncated = textContent?.slice(0, 15000) || '';
  const today = new Date().toDateString();

  const prompt = `
You are a balanced, professional fact-checker assessing the credibility and reliability of a webpage.

Today's date: ${today}
URL: ${url}

CRITICAL RULES — follow these before analysing anything:
1. Today is ${today}. Do NOT treat any date on or before today as a future or impossible date.
2. If the page is a NEWS HOMEPAGE or NEWS FEED (many short headlines, navigation menus, no single full article body), do NOT attempt to fact-check individual headlines. Headlines are teasers without full context and cannot be fairly verified in isolation. Instead, assess the overall source credibility, writing style, and visible editorial standards.
3. For well-known, established news organisations (straitstimes.com, bbc.com, reuters.com, cnn.com, nytimes.com, theguardian.com, channelnewsasia.com, ap.org, bloomberg.com, wsj.com, ft.com), the default verdict should be "trustworthy" unless the content itself contains clear, obvious factual errors or manipulative language.
4. Use "unverified" sparingly — only for specific extraordinary claims that genuinely require independent evidence. Do NOT use it as a default for every headline on a news homepage.
5. Only use "false" or "misleading" for claims where you have clear, certain knowledge they contradict established facts.
6. The "claims" array should only include substantive claims from a full article body. If the page is a homepage or feed with only headlines, return an empty claims array [] rather than listing unverifiable headlines.
7. Keep confidenceScore between 20–80 unless evidence is truly overwhelming in either direction.

Page Content:
${truncated || 'Content could not be extracted — base your analysis on the URL and domain alone.'}

Respond in JSON format only, no markdown:
{
  "verdict": "trustworthy" | "questionable" | "misleading",
  "confidenceScore": 0-100,
  "summary": "2-3 sentence balanced assessment of the source and content reliability",
  "claims": [
    {
      "claim": "only include claims from full article body text, not homepage headlines",
      "verdict": "true" | "false" | "unverified" | "misleading",
      "explanation": "brief, fair explanation citing specific reasons"
    }
  ],
  "redFlags": ["only genuine, specific credibility concerns — not speculative"],
  "positiveIndicators": ["credibility signals found, e.g. named authors, cited sources, editorial standards"]
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