const express = require('express');
const router = express.Router();
const congesController = require('../controllers/congesController');

// GET /api/conges -> liste des demandes (mock)
router.get('/', congesController.getMyConges);

// POST /api/conges -> créer une demande (mock)
router.post('/', congesController.createConge);

module.exports = router;