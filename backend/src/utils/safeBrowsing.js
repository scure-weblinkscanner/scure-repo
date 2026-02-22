import axios from 'axios';

export const scanWithSafeBrowsing = async (url) => {
  try {
    const res = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
      {
        client: { clientId: 'scure', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      }
    );

    const matches = res.data.matches || [];
    return {
      verdict: matches.length > 0 ? 'malicious' : 'clean',
      threats: matches.map(m => m.threatType),
    };
  } catch (error) {
    return { verdict: 'unknown', reason: error.message };
  }
};