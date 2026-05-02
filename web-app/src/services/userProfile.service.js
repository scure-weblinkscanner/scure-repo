import { apiFetch } from './api'

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/userProfile`

export const createUserProfile = async (data, token) => {
  const res = await apiFetch(`${BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create user profile')
  return await res.json()
}

export const getAllUserProfiles = async () => {
  const res = await apiFetch(`${BASE_URL}`)
  if (!res.ok) throw new Error('Failed to fetch user profiles')
  return await res.json()
}

export const getUserProfileById = async (userProfileId) => {
  const res = await apiFetch(`${BASE_URL}/${userProfileId}`)
  if (!res.ok) throw new Error('Failed to fetch user profile')
  return await res.json()
}

export const searchUserProfiles = async (query, token) => {
  const res = await apiFetch(`${BASE_URL}/search?q=${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to search user profiles')
  return await res.json()
}

export const updateUserProfile = async (userProfileId, data, token) => {
  const res = await apiFetch(`${BASE_URL}/${userProfileId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update user profile')
  return await res.json()
}

export const deleteUserProfile = async (userProfileId, token) => {
  const res = await apiFetch(`${BASE_URL}/${userProfileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.message || 'Failed to delete user profile')
  return data
}
