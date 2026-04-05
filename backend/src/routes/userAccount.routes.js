import express from 'express'
import * as userAccountController from '../controllers/userAccount.controller.js'

const router = express.Router()

router.post('/', userAccountController.createUserAccount)
router.get('/', userAccountController.getAllUserAccounts)
router.get('/search', userAccountController.searchUserAccounts)

// static routes BEFORE dynamic ones
router.post('/login', userAccountController.loginUserAccount)
router.post('/login/admin', userAccountController.loginAdminUserAccount)
router.get('/check-email', userAccountController.checkEmailExists)

// dynamic route LAST
router.get('/:uaId', userAccountController.getUserAccountById)
router.put('/:uaId', userAccountController.updateUserAccount)
router.delete('/:uaId', userAccountController.deleteUserAccount)

export default router