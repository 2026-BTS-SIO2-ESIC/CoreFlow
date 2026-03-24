const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { testConnection } = require("./config/database");

// Import de routes 
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

app.get("/api/conges", (req, res) => {

  const conges = [
    {
      id: 1,
      nom: "Sophie Martin",
      type: "Congé payé",
      periode: "15 - 25 Déc 2024",
      duree: "11 jours"
    }
  ]

  res.json(conges)  
})


const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Le Serveur de CoreFlow a démarré sur http://localhost:${PORT}`);
});

module.exports = app;
