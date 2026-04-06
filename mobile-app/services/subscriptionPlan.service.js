import BASE_URL from '../constants/api';

export const getSubscriptionByUser = async (uaId, token) => {
  const response = await fetch(`${BASE_URL}/subscriptionPlan/user/${uaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch subscription');
  return data;
};

export const cancelSubscription = async (spId, uaId, token) => {
  const response = await fetch(`${BASE_URL}/subscriptionPlan/${spId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ uaId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to cancel subscription');
  return data;
};
