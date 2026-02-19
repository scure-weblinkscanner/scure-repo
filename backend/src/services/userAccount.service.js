import * as userAccountDb from '../database/userAccount.db.js'

export const createUserAccount = async (data) => {
  return await userAccountDb.createUserAccount(data)
}

export const getAllUserAccounts = async () => {
  return await userAccountDb.getAllUserAccounts()
}

export const getUserAccountById = async (uaId) => {
  return await userAccountDb.getUserAccountById(uaId)
}

export const searchUserAccounts = async (query) => {
  return await userAccountDb.searchUserAccounts(query)
}

export const updateUserAccount = async (uaId, updates) => {
  return await userAccountDb.updateUserAccount(uaId, updates)
}

export const deleteUserAccount = async (uaId) => {
  // example of business logic in the control layer
  const account = await userAccountDb.getUserAccountById(uaId)
  if (!account) throw new Error('User account not found')
  return await userAccountDb.deleteUserAccount(uaId)
}