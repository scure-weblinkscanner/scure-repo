import { apiFetch } from './api';

export const getTicketsByUser = async (uaId, token) => {
  const response = await apiFetch(`/tickets/user/${uaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server error (${response.status})`);
  }
  if (!response.ok) throw new Error(data.message || 'Failed to fetch tickets');
  return data.tickets ?? [];
};

export const submitTicket = async (token, subject, description) => {
  const response = await apiFetch('/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tkSubject: subject, tkDescription: description }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('Failed to submit ticket. Please try again.');
  return data;
};
