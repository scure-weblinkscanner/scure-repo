import express from 'express'
import * as userProfileController from '../controllers/userProfile.controller.js'

const router = express.Router()

router.post('/', userProfileController.createUserProfile)
router.get('/', userProfileController.getAllUserProfiles)
router.get('/search', userProfileController.searchUserProfiles)
router.get('/:userProfileId', userProfileController.getUserProfileById)
router.put('/:userProfileId', userProfileController.updateUserProfile)
router.delete('/:userProfileId', userProfileController.deleteUserProfile)

export default router