const express = require('express');
const router = express.Router();

const congesController = require('../controllers/congesController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, congesController.getMyConges);
router.get('/solde', authenticate, congesController.getSoldeConges);
router.post('/', authenticate, congesController.createConge);
router.put('/:id/annuler', authenticate, congesController.annulerConge);
router.get('/stats', authenticate, congesController.getStats);
router.put('/:id/valider', authenticate, congesController.valider);
router.put('/:id/refuser', authenticate, congesController.refuser);
router.put('/:id/annuler-validation', authenticate, congesController.annulerValidation);
router.put('/:id/annuler-refus', authenticate, congesController.annulerRefus);

module.exports = router;