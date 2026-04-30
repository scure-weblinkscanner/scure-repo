const BASE_URL = `${import.meta.env.VITE_API_URL}/api/userAccount`

export const getAllUserAccounts = async (token) => {
  const res = await fetch(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch user accounts')
  return await res.json()
}

export const getUserAccountById = async (uaId, token) => {
  const res = await fetch(`${BASE_URL}/${uaId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch user account')
  return await res.json()
}

export const searchUserAccounts = async (query, token) => {
  const res = await fetch(`${BASE_URL}/search?q=${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to search user accounts')
  return await res.json()
}

export const updateUserAccount = async (uaId, data, token) => {
  const res = await fetch(`${BASE_URL}/${uaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update user account')
  return await res.json()
}

export const deleteUserAccount = async (uaId, token) => {
  const res = await fetch(`${BASE_URL}/${uaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to delete user account')
  return await res.json()
}

export const registerUserAccount = async (username, email, password, userProfileId) => {
  const body = { uaUsername: username, uaEmail: email, uaPasswordHash: password }
  if (userProfileId) body.uaUserProfileId = userProfileId
  const res = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to register account')
  return data
}

export const loginUserAccount = async (uaEmail, uaPassword, loginAs = 'user') => {
  const endpoint = loginAs === 'admin' ? '/login/admin' : '/login'

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uaEmail, uaPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data;
};
