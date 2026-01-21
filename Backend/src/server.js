const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API CoreFlow !',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Route de santé (health check)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Le Serveur de CoreFlow a démarré sur http://localhost:${PORT}`);
});

module.exports = app;