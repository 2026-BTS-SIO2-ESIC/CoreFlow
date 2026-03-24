const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { testConnection } = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const congesRoutes = require("./routes/congesRoutes");
const eventRouter = require("./routes/eventRoutes");
const documentRoutes = require("./routes/documentRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Test de connexion à la BDD au démarrage
testConnection();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/conges", congesRoutes);
app.use("/api/event", eventRouter);
app.use("/api/documents", documentRoutes);

// AJOUT : Rendre le dossier "uploads" accessible publiquement
// "__dirname" c'est ton dossier "src". On fait "../uploads" pour remonter d'un cran.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Route de test santé
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
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

app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Le Serveur de CoreFlow a démarré sur http://localhost:${PORT}`);
});

module.exports = app;
