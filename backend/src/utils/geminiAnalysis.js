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
    .slice(0, 10000); // limit to avoid token overflow

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