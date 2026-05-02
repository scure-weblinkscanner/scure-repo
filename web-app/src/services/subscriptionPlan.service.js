import { apiFetch } from './api'

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/subscriptionPlan`

export const getSubscriptionByUser = async (uaId, token) => {
  const res = await apiFetch(`${BASE_URL}/user/${uaId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Failed to fetch subscription')
  return data
}

export const cancelSubscription = async (spId, uaId, token) => {
  const res = await apiFetch(`${BASE_URL}/${spId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ uaId }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Unable to cancel subscription. Please try again.')
  return data
}
