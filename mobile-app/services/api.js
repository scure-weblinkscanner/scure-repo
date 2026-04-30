const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

let onUnauthorized = null;

export const setOnUnauthorized = (cb) => {
  onUnauthorized = cb;
};

export const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (response.status === 401) {
    onUnauthorized?.();
    throw new Error('Session expired. Please log in again.');
  }
  if (response.status >= 500) {
    throw new Error('Server is currently unavailable. Please try again later.');
  }
  return response;
};
