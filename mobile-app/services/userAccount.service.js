import { apiFetch } from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const loginUserAccount = async (uaEmail, uaPassword) => {
  const response = await fetch(`${BASE_URL}/userAccount/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uaEmail, uaPassword }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('Invalid email or password.');
  return data;
};

export const getUserAccountById = async (uaId, token) => {
  const response = await apiFetch(`/userAccount/${uaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch account');
  return data;
};

export const deleteUserAccount = async (uaId, token) => {
  const response = await apiFetch(`/userAccount/${uaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete account');
  }
};

export const updateUserAccount = async (uaId, data, token) => {
  const response = await apiFetch(`/userAccount/${uaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || `Server error: ${response.status}`);
  return result;
};
