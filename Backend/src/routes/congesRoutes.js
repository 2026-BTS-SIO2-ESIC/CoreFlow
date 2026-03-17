const express = require('express');
const router = express.Router();
const congesController = require('../controllers/congesController');
const { protect } = require('../middlewares/authMiddleware');


// GET /api/conges -> liste des demandes (mock)
router.get("/", protect, getMyConges);

router.post("/", protect, createConge);

router.put("/:id/annuler", protect, annulerConge);

router.get("/solde", protect, getSolde);

module.exports = router;