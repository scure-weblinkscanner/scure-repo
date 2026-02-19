import * as userAccountDb from '../database/userAccount.db.js'
import bcrypt from 'bcrypt'

export const createUserAccount = async (data) => {
  const passwordHash = await bcrypt.hash(data.uaPasswordHash, 10)
  return await userAccountDb.createUserAccount({
    ...data,
    uaPasswordHash: passwordHash
  })
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

export const loginUserAccount = async (email, password) => {
  const account = await userAccountDb.getUserAccountByEmail(email)
  if (!account) throw new Error('Invalid email or password')

  const isMatch = await bcrypt.compare(password, account.uaPasswordHash)
  if (!isMatch) throw new Error('Invalid email or password')

  return account
}