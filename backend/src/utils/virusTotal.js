import axios from 'axios';

export const scanWithVirusTotal = async (url) => {
  try {
    const encodedURL = Buffer.from(url).toString('base64').replace(/=+$/, '');

    const res = await axios.get(`https://www.virustotal.com/api/v3/urls/${encodedURL}`, {
      headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
    });

    const stats = res.data.data.attributes.last_analysis_stats;
    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    return {
      verdict: stats.malicious > 0 ? 'malicious' : stats.suspicious > 0 ? 'suspicious' : 'clean',
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      clean: stats.undetected,
      total,
    };
  } catch (error) {
    return { verdict: 'unknown', reason: error.message };
  }
};