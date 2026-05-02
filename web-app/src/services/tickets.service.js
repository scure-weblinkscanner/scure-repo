import { apiFetch } from './api'

const BASE_URL = import.meta.env.VITE_API_URL;

export const getAllTickets = async (token) => {
  const res = await apiFetch(`${BASE_URL}/api/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tickets');
  return data.tickets;
};

export const respondToTicket = async (token, tkId, tkAdminResponse, tkStatus) => {
  const res = await apiFetch(`${BASE_URL}/api/tickets/${tkId}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tkAdminResponse, tkStatus }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to respond to ticket');
  return data.ticket;
};
