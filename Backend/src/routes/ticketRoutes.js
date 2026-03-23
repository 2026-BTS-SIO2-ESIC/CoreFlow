const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/', authenticate, ticketController.create);
router.get('/my-tickets', authenticate, ticketController.getMyTickets);
router.get('/:id', authenticate, ticketController.getTicketDetails);

module.exports = router;