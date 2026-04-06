import express from 'express'
import { getAllTickets, getTicketById, getTicketsByUser, createTicket, respondToTicket } from '../controllers/tickets.controller.js'

const router = express.Router()

router.get('/', getAllTickets)
router.get('/user/:uaId', getTicketsByUser)
router.get('/:tkId', getTicketById)
router.post('/', createTicket)
router.patch('/:tkId/respond', respondToTicket)

export default router