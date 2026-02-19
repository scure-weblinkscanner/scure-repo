import express from 'express'
import * as userAccountController from '../controllers/userAccount.controller.js'

const router = express.Router()

router.post('/', userAccountController.createUserAccount)
router.get('/', userAccountController.getAllUserAccounts)
router.get('/search', userAccountController.searchUserAccounts)
router.get('/:uaId', userAccountController.getUserAccountById)
router.put('/:uaId', userAccountController.updateUserAccount)
router.delete('/:uaId', userAccountController.deleteUserAccount)
router.post('/login', userAccountController.loginUserAccount)

export default router