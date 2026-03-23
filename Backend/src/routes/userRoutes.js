const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateUserCreation, validateUserUpdate } = require('../middlewares/validationMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET /api/users - Liste tous les utilisateurs (admin, rh, manager)
router.get('/', authorize('admin', 'rh', 'manager'), userController.getAllUsers);

// GET /api/users/:id - Récupérer un utilisateur (admin, rh, manager)
router.get('/:id', authorize('admin', 'rh', 'manager'), userController.getUserById);

// POST /api/users - Créer un utilisateur (admin, rh uniquement)
router.post('/', authorize('admin', 'rh'), validateUserCreation, userController.createUser);

// PUT /api/users/:id - Modifier un utilisateur (admin, rh)
router.put('/:id', authorize('admin', 'rh'), validateUserUpdate, userController.updateUser);

// PATCH /api/users/:id/toggle-status - Activer/Désactiver (admin, rh)
router.patch('/:id/toggle-status', authorize('admin', 'rh'), userController.toggleUserStatus);

// DELETE /api/users/:id - Supprimer un utilisateur (admin uniquement)
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;