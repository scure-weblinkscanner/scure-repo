import { apiFetch } from './api';

export const analyzeUrl = async (url, token, scanMethod = 'cameraUrl', skipBlocklist = false, adDetection = false) => {
  const response = await apiFetch('/scanURL/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, scanMethod, skipBlocklist, adDetection }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server error: ${response.status}`);
  }
  return response.json();
};

export const fetchScanHistory = async (token) => {
  const response = await apiFetch('/scanURL/history', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server error: ${response.status}`);
  }
  return response.json();
};

export const publishScanHistory = async (shId, token) => {
  const response = await apiFetch(`/scanURL/history/${shId}/publish`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server error: ${response.status}`);
  }
  return response.json();
};

export const fetchPublicScans = async (token) => {
  const response = await apiFetch('/scanURL/public', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server error: ${response.status}`);
  }
  return response.json();
};
