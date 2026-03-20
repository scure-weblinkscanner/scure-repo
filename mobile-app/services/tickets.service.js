const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const submitTicket = async (token, subject, description) => {
  const response = await fetch(`${BASE_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ tkSubject: subject, tkDescription: description }),
  });
  return response.json();
};