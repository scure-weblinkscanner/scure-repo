import express from 'express';
import * as userProfileController from '../controllers/userProfile.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public — needed for profile type lookup during signup
router.get('/', userProfileController.getAllUserProfiles);

// Admin only
router.get('/search', requireAdmin, userProfileController.searchUserProfiles);

// Public — needed for profile type lookup during signup
router.get('/:userProfileId', userProfileController.getUserProfileById);

// Admin only
router.post('/', requireAdmin, userProfileController.createUserProfile);
router.put('/:userProfileId', requireAdmin, userProfileController.updateUserProfile);
router.delete('/:userProfileId', requireAdmin, userProfileController.deleteUserProfile);

export default router;
