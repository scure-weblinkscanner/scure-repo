import axios from 'axios';

export const scanWithURLScan = async (url) => {
  try {
    const submitRes = await axios.post('https://urlscan.io/api/v1/scan/', 
      { url, visibility: 'public' },
      { headers: { 
        'Content-Type': 'application/json',
        'API-Key': process.env.URLSCAN_API_KEY
      }}
    );

    const uuid = submitRes.data.uuid;

    // retry up to 5 times with 5 second intervals
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      try {
        const resultRes = await axios.get(`https://urlscan.io/api/v1/result/${uuid}/`);
        const data = resultRes.data;
        return {
          verdict: data.verdicts?.overall?.malicious ? 'malicious' : 'clean',
          score: data.verdicts?.overall?.score || 0,
          categories: data.verdicts?.overall?.categories || [],
          screenshot: data.task?.screenshotURL || null,
          uuid,
        };
      } catch {
        // not ready yet, continue retrying
        continue;
      }
    }

    return { verdict: 'unknown', reason: 'URLScan timed out' };
  } catch (error) {
    console.log('URLScan error:', error.response?.data || error.message);
    return { verdict: 'unknown', reason: error.message };
  }
};