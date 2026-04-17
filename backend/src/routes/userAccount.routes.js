import express from 'express';
import * as userAccountController from '../controllers/userAccount.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Public
router.post('/', authLimiter, userAccountController.createUserAccount);
router.post('/login', authLimiter, userAccountController.loginUserAccount);
router.post('/login/admin', authLimiter, userAccountController.loginAdminUserAccount);
router.get('/check-email', userAccountController.checkEmailExists);

// Admin only
router.get('/', requireAdmin, userAccountController.getAllUserAccounts);
router.get('/search', requireAdmin, userAccountController.searchUserAccounts);

// Authenticated (self-only enforced in controller)
router.get('/:uaId', requireAuth, userAccountController.getUserAccountById);
router.put('/:uaId', requireAuth, userAccountController.updateUserAccount);
router.delete('/:uaId', requireAuth, userAccountController.deleteUserAccount);

export default router;
