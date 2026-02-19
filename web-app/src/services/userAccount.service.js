const BASE_URL = 'http://localhost:5000/api/userAccount'

export const createUserAccount = async (req, res) => {
  try {
    const result = await userAccountService.createUserAccount(req.body)
    res.status(201).json(result)
  } catch (error) {
    console.error('createUserAccount error:', error.message) // add this
    res.status(500).json({ error: error.message })
  }
}

export const getAllUserAccounts = async () => {
  const res = await fetch(`${BASE_URL}`)
  if (!res.ok) throw new Error('Failed to fetch user accounts')
  return await res.json()
}

export const getUserAccountById = async (uaId) => {
  const res = await fetch(`${BASE_URL}/${uaId}`)
  if (!res.ok) throw new Error('Failed to fetch user account')
  return await res.json()
}

export const searchUserAccounts = async (query) => {
  const res = await fetch(`${BASE_URL}/search?q=${query}`)
  if (!res.ok) throw new Error('Failed to search user accounts')
  return await res.json()
}

export const updateUserAccount = async (uaId, data) => {
  const res = await fetch(`${BASE_URL}/${uaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update user account')
  return await res.json()
}

export const deleteUserAccount = async (uaId) => {
  const res = await fetch(`${BASE_URL}/${uaId}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete user account')
  return await res.json()
}

export const registerUserAccount = async (username, email, password) => {
  const res = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uaUsername: username,
      uaEmail: email,
      uaPasswordHash: password  // backend will hash this
    })
  })
  if (!res.ok) throw new Error('Failed to register account')
  return await res.json()
}

export const loginUserAccount = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error('Invalid email or password')
  return await res.json()
}