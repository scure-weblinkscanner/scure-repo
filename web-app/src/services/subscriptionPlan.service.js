const BASE_URL = `${import.meta.env.VITE_API_URL}/api/subscriptionPlan`

export const getSubscriptionByUser = async (uaId) => {
  const res = await fetch(`${BASE_URL}/user/${uaId}`)
  if (!res.ok) throw new Error('Failed to fetch subscription')
  return await res.json()
}

export const cancelSubscription = async (spId, uaId) => {
  const res = await fetch(`${BASE_URL}/${spId}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uaId }),
  })
  if (!res.ok) throw new Error('Failed to cancel subscription')
  return await res.json()
}