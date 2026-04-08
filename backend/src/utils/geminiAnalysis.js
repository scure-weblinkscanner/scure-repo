import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: 'v1'
});

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
  "reason": "brief explanation",
  "indicators": ["list", "of", "suspicious", "indicators"]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    return { verdict: 'unknown', reason: 'AI analysis failed to parse.', riskScore: 50, indicators: [] };
  }
};

export const generateSuggestion = async (riskScore, flaggedBy, scoreLabel, url) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are a cybersecurity assistant giving advice to a regular user about a URL they want to visit.

URL: ${url}
Risk Score: ${riskScore}/100
Risk Level: ${scoreLabel}
Flagged as malicious by: ${flaggedBy.length > 0 ? flaggedBy.join(', ') : 'None'}

No need for greetings. Give a short, clear, friendly safety suggestion (2-3 sentences max) for this user. 
Do not use technical jargon. Be direct about whether they should visit the URL or not.
Respond with plain text only, no JSON, no markdown.
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.log('Gemini suggestion error:', error.message);
    return flaggedBy.length > 0
      ? `Proceed with caution. This URL was flagged by: ${flaggedBy.join(', ')}.`
      : 'No threats detected. Safe to proceed.';
  }
};

// ── Misinformation / fact-check analysis ──
export const analyzeForMisinformation = async (url, textContent) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const truncated = textContent?.slice(0, 15000) || '';

  const prompt = `
You are a professional fact-checker and misinformation analyst. Analyze the following webpage content for misinformation, false claims, misleading statements, or propaganda.

URL: ${url}

Page Content:
${truncated || 'Content could not be extracted — base your analysis on the URL and domain alone.'}

Analyze the content and respond in JSON format only, no markdown:
{
  "verdict": "trustworthy" | "questionable" | "misleading",
  "confidenceScore": 0-100,
  "summary": "2-3 sentence overall assessment of the content's reliability",
  "claims": [
    {
      "claim": "a specific claim found in the content (max 5 claims)",
      "verdict": "true" | "false" | "unverified" | "misleading",
      "explanation": "brief explanation of why"
    }
  ],
  "redFlags": ["list of misinformation indicators or credibility concerns found"],
  "positiveIndicators": ["list of credibility signals or trustworthy signs found"]
}

Assess: factual accuracy, presence of cited sources, emotional manipulation language, missing context, logical fallacies, and whether claims are verifiable. Keep the claims array to a maximum of 5 most important claims.
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
        return JSON.parse(jsonStr);
      } catch {
        return {
          verdict: 'questionable',
          confidenceScore: 50,
          summary: 'Analysis could not be fully completed. Review the content manually.',
          claims: [],
          redFlags: [],
          positiveIndicators: [],
        };
      }
    } catch (error) {
      const isOverload = error.message?.includes('503') || error.message?.includes('high demand');
      console.error(`Misinformation analysis error (attempt ${attempt}/${maxRetries}):`, error.message);

      if (isOverload && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
        continue;
      }

      throw error;
    }
  }
};