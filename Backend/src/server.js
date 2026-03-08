// Toujours mettre dotenv en tout premier !
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // AJOUT : Pour gérer les chemins de dossiers

// AJOUT : Import de tes routes (qui lient vers les controllers)
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AJOUT : Rendre le dossier "uploads" accessible publiquement
// "__dirname" c'est ton dossier "src". On fait "../uploads" pour remonter d'un cran.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// AJOUT : Branchement des APIs
// Dès qu'une requête commence par /api/documents, on l'envoie vers documentRoutes.js
app.use('/api/documents', documentRoutes);


// --- TES ROUTES DE TEST (On les garde !) ---
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API CoreFlow !',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Le Serveur de CoreFlow a démarré sur http://localhost:${PORT}`);
});

module.exports = app;