import express from 'express'
import { getAllTickets, getTicketById, createTicket, respondToTicket } from '../controllers/tickets.controller.js'

const router = express.Router()

router.get('/', getAllTickets)
router.get('/:tkId', getTicketById)
router.post('/', createTicket)
router.patch('/:tkId/respond', respondToTicket)

export default router