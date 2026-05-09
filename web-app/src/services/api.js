let _onUnauthorized = null;

export const setOnUnauthorized = (cb) => { _onUnauthorized = cb; };

export const apiFetch = async (url, options = {}) => {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('Service is currently unavailable. Please try again later.');
  }
  if (response.status === 401) {
    _onUnauthorized?.();
    throw new Error('Your session has expired. Please log in again.');
  }
  if (response.status >= 500) {
    throw new Error('Service is currently unavailable. Please try again later.');
  }
  // Catch proxy/infrastructure errors (e.g. Railway "application not found") that
  // return non-JSON bodies with a non-2xx status
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Service is currently unavailable. Please try again later.');
    }
  }
  return response;
};
