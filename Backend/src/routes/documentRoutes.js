const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const documentController = require('../controllers/documentController');

//On importe le middleware d'authentification
const { authenticate } = require('../middlewares/authMiddleware');

// On force toutes les routes de ce fichier à passer par l'authentification
router.use(authenticate);

//L'URL de base pour les documents est /api/documents
// Route pour créer un document avec un fichier
router.post('/', upload.single('fichier'), (req, res) => documentController.createDocument(req, res));
// Route pour récupérer tous les documents
router.get('/', documentController.getDocuments);
// Route pour supprimer un document par ID
router.delete('/:id', (req, res) => documentController.deleteDocument(req, res));

module.exports = router;