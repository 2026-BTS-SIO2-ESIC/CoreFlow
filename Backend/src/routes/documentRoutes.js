const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middlewares/authMiddleware');// Middleware d'authentification pour protéger les routes

//On importe le middleware d'authentification
const { authenticate } = require('../middlewares/authMiddleware');

// On force toutes les routes de ce fichier à passer par l'authentification
router.use(authenticate);
const { authenticate } = require('../middlewares/authMiddleware');

//L'URL de base pour les documents est /api/documents
// Route pour créer un document avec un fichier
router.post('/', upload.single('fichier'), (req, res) => documentController.createDocument(req, res));
// Route pour récupérer tous les documents
router.get('/', documentController.getDocuments);
// Route pour supprimer un document par ID
router.delete('/:id', (req, res) => documentController.deleteDocument(req, res));
// Route pour enregistrer une consultation (lorsqu'un document est téléchargé ou vu
router.patch('/:id/consulter', (req, res) => documentController.consulterDocument(req, res));// Route pour mettre à jour un document par ID


module.exports = router;