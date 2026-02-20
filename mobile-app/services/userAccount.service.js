import BASE_URL from '../constants/api';

export const loginUserAccount = async (uaEmail, uaPassword) => {
  const response = await fetch(`${BASE_URL}/userAccount/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uaEmail, uaPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data; // { token, account }
};