const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// GET /api/utilisateurs  (public)
router.get('/', userController.getAllUsers);

// GET /api/utilisateurs/admin  (protégé - admin uniquement)
router.get('/admin', verifyToken, isAdmin, userController.getAllUsersAdmin);

// PUT /api/utilisateurs/password  (protégé - utilisateur connecté)
router.put('/password', verifyToken, userController.updatePassword);

module.exports = router;
