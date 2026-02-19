import * as userAccountService from '../services/userAccount.service.js'

export const createUserAccount = async (req, res) => {
  try {
    const result = await userAccountService.createUserAccount(req.body)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getAllUserAccounts = async (req, res) => {
  try {
    const result = await userAccountService.getAllUserAccounts()
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserAccountById = async (req, res) => {
  try {
    const result = await userAccountService.getUserAccountById(req.params.uaId)
    if (!result) return res.status(404).json({ error: 'User account not found' })
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const searchUserAccounts = async (req, res) => {
  try {
    const result = await userAccountService.searchUserAccounts(req.query.q)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateUserAccount = async (req, res) => {
  try {
    const result = await userAccountService.updateUserAccount(req.params.uaId, req.body)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteUserAccount = async (req, res) => {
  try {
    await userAccountService.deleteUserAccount(req.params.uaId)
    res.status(200).json({ message: 'User account deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}