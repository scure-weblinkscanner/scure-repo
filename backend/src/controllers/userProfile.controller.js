import * as userProfileService from '../services/userProfile.service.js'

export const createUserProfile = async (req, res) => {
  try {
    const result = await userProfileService.createUserProfile(req.body)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getAllUserProfiles = async (req, res) => {
  try {
    const result = await userProfileService.getAllUserProfiles()
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserProfileById = async (req, res) => {
  try {
    const result = await userProfileService.getUserProfileById(req.params.userProfileId)
    if (!result) return res.status(404).json({ error: 'User profile not found' })
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const searchUserProfiles = async (req, res) => {
  try {
    const result = await userProfileService.searchUserProfiles(req.query.q)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const result = await userProfileService.updateUserProfile(req.params.userProfileId, req.body)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteUserProfile = async (req, res) => {
  try {
    await userProfileService.deleteUserProfile(req.params.userProfileId)
    res.status(200).json({ message: 'User profile deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}