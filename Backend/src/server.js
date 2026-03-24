const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { testConnection } = require("./config/database");

// Import de tes routes (Ton code)
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Test de connexion à la BDD au démarrage
testConnection();

// Middlewares
app.use(cors());
app.use(express.json());

// Les route event sont construit ici puis utiliser
const eventRouter = require("./routes/eventRoutes");
// La route mis par defaut pour aceder au calls events
app.use("/api/event", eventRouter);
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const ticketRoutes = require("./routes/ticketRoutes")

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ticket", ticketRoutes)

const congesRoutes = require('./routes/congesRoutes');
app.use('/api/conges', congesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// AJOUT : Rendre le dossier "uploads" accessible publiquement
// "__dirname" c'est ton dossier "src". On fait "../uploads" pour remonter d'un cran.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// AJOUT : Branchement des APIs
// Dès qu'une requête commence par /api/documents, on l'envoie vers documentRoutes.js
app.use('/api/documents', documentRoutes);

// Route de test santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime()
  });
});

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API CoreFlow !",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Route de santé (health check)
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
  });
});

// Note: L'API /api/conges est déjà gérée par congesRoutes, pas besoin de doublon ci-dessous
// app.get("/api/conges", (req, res) => {
//   res.json({
//     message: "API de gestion des congés",
//     status: "OK",
//     timestamp: new Date().toISOString(),
//   }); 
// })


const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Le Serveur de CoreFlow a démarré sur http://localhost:${PORT}`);
});

module.exports = app;
