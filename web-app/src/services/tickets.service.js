const BASE_URL = import.meta.env.VITE_API_URL;

export const getAllTickets = async (token) => {
  const res = await fetch(`${BASE_URL}/api/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.tickets;
};

export const respondToTicket = async (token, tkId, tkAdminResponse, tkStatus) => {
  const res = await fetch(`${BASE_URL}/api/tickets/${tkId}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tkAdminResponse, tkStatus }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.ticket;
};