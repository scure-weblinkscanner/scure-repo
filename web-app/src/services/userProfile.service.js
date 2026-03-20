const BASE_URL = `${import.meta.env.VITE_API_URL}/api/userProfile`

export const createUserProfile = async (data) => {
  const res = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create user profile')
  return await res.json()
}

export const getAllUserProfiles = async () => {
  const res = await fetch(`${BASE_URL}`)
  if (!res.ok) throw new Error('Failed to fetch user profiles')
  return await res.json()
}

export const getUserProfileById = async (userProfileId) => {
  const res = await fetch(`${BASE_URL}/${userProfileId}`)
  if (!res.ok) throw new Error('Failed to fetch user profile')
  return await res.json()
}

export const searchUserProfiles = async (query) => {
  const res = await fetch(`${BASE_URL}/search?q=${query}`)
  if (!res.ok) throw new Error('Failed to search user profiles')
  return await res.json()
}

export const updateUserProfile = async (userProfileId, data) => {
  const res = await fetch(`${BASE_URL}/${userProfileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update user profile')
  return await res.json()
}

export const deleteUserProfile = async (userProfileId) => {
  const res = await fetch(`${BASE_URL}/${userProfileId}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete user profile')
  return await res.json()
}