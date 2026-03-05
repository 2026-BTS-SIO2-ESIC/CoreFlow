// On importe les bibliothèques
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import des configurations et middlewares
const { testConnection } = require('./config/database');
const db = require('./config/database'); // Gardé pour tes requêtes directes plus bas
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Import des routes structurées
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Test de connexion à la BDD au démarrage
testConnection();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES STRUCTURÉES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// --- ROUTES DE TEST & INFO ---
app.get('/', (req, res) => {
  res.send('🫵🏾🫵🏾 Serveur Node.JS opérationnel 🫵🏾🫵🏾👌');
});

app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Bonjour depuis l\'API: Test réussie !',
    version: '1.0.0',
    status: 'Opérationnel' 
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    app: 'CoreFlow',
    auteur: 'Volmy',
    rôles: ['employée', 'manager', 'rh', 'IT', 'admin'],
  });
});

// --- ENDPOINTS BDD DIRECTS (Tes tests) ---

// Test de l'heure BDD
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS currentTime');
    res.json({ databaseTime: rows[0].currentTime });
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    res.status(500).json({ error: 'Erreur de connexion à la base de données' });
  }
});

// Liste des événements à venir
app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, Titre, Description, Date_debut, Date_fin, Lieu, organisateur_id FROM evenements WHERE Date_debut >= NOW() ORDER BY Date_debut ASC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' });
  }
});

// Liste des événements passés
app.get('/api/P-events', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, Titre, Description, Date_debut, Date_fin, Lieu, organisateur_id FROM evenements WHERE Date_debut <= NOW() ORDER BY Date_debut ASC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements passés:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' });
  }
});

// --- GESTION D'ERREURS (Toujours en dernier) ---
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Le serveur démarre sur http://localhost:${PORT}`);
});