const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Sends a URL to the backend for analysis.
 * @param {string} url - The URL to scan
 * @param {string} token - JWT from useAuth()
 * @returns {Promise<ScanResult>}
 */
export const analyzeUrl = async (url, token) => {
  const response = await fetch(`${BASE_URL}/scanURL/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server error: ${response.status}`);
  }

  return response.json();
};