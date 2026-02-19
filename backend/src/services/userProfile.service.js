import * as userProfileDb from '../database/userProfile.db.js'

export const createUserProfile = async (data) => {
  return await userProfileDb.createUserProfile(data)
}

export const getAllUserProfiles = async () => {
  return await userProfileDb.getAllUserProfiles()
}

export const getUserProfileById = async (userProfileId) => {
  return await userProfileDb.getUserProfileById(userProfileId)
}

export const searchUserProfiles = async (query) => {
  return await userProfileDb.searchUserProfiles(query)
}

export const updateUserProfile = async (userProfileId, updates) => {
  return await userProfileDb.updateUserProfile(userProfileId, updates)
}

export const deleteUserProfile = async (userProfileId) => {
  const profile = await userProfileDb.getUserProfileById(userProfileId)
  if (!profile) throw new Error('User profile not found')
  return await userProfileDb.deleteUserProfile(userProfileId)
}