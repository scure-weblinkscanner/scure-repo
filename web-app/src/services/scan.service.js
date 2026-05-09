import { apiFetch } from './api'

const BASE_URL = import.meta.env.VITE_API_URL;

export const getScanActivity = async (token, period) => {
  const res = await apiFetch(`${BASE_URL}/api/scanURL/admin/activity?period=${period.toLowerCase()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const getAllScans = async (token) => {
  const res = await apiFetch(`${BASE_URL}/api/scanURL/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.scans;
};
