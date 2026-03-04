require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', userRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: "Bienvenue sur l'API CoreFlow !",
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime()
  });
});

app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));

module.exports = app;
