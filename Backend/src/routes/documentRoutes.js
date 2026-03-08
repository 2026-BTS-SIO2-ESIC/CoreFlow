const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const documentController = require('../controller/documentController');


//L'URL de base pour les documents est /api/documents
// Route pour créer un document avec un fichier
router.post('/', upload.single('fichier'), (req, res) => documentController.createDocument(req, res));

module.exports = router;