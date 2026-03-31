const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middlewares/authMiddleware');// Middleware d'authentification pour protéger les routes

const { authenticate } = require('../middlewares/authMiddleware');

//L'URL de base pour les documents est /api/documents
// Route pour créer un document avec un fichier
router.post('/', upload.single('fichier'), (req, res) => documentController.createDocument(req, res));
// Route pour récupérer tous les documents
router.get('/', documentController.getDocuments);
// Route pour supprimer un document par ID
router.delete('/:id', (req, res) => documentController.deleteDocument(req, res));
// Route pour mettre à jour un document par ID
router.put('/:id', authenticate, (req, res) => documentController.updateDocument(req, res));

module.exports = router;