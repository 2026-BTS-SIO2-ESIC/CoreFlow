const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de Multer pour le téléchargement de fichiers
// on verifie que le dossier "uploads" dans le dossier "Backend" existe sinon on le crée
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Crée le dossier "uploads" et tous les dossiers parents nécessaires
} 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Stockage dans le dossier "uploads" à la racine du projet
    },
    filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

module.exports = multer({ storage: storage });