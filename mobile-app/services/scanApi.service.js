const BASE_URL = 'http://192.168.0.119:5000/api';

/**
 * Sends a URL to the backend for analysis.
 * @param {string} url - The URL to scan
 * @param {string} token - JWT from useAuth()
 * @returns {Promise<ScanResult>}
 */
export const analyzeUrl = async (url, token, scanMethod = 'cameraUrl') => {
  const response = await fetch(`${BASE_URL}/scanURL/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, scanMethod }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server error: ${response.status}`);
  }
  return response.json();
};

export const fetchScanHistory = async (token) => {
  const response = await fetch(`${BASE_URL}/scanURL/history`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Server error: ${response.status}`)
  }
  return response.json()
}

export const publishScanHistory = async (shId, token) => {
  const response = await fetch(`${BASE_URL}/scanURL/history/${shId}/publish`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Server error: ${response.status}`)
  }
  return response.json()
}

export const fetchPublicScans = async (token) => {
  const response = await fetch(`${BASE_URL}/scanURL/public`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Server error: ${response.status}`)
  }
  return response.json()
}