const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { testConnection } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Test de connexion à la BDD au démarrage
testConnection();

//Routes
const ticketRoutes = require('./routes/ticketRoutes');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/tickets', ticketRoutes);

// Les route event sont construit ici puis utiliser
const eventRouter = require("./routes/eventRoutes");
// La route mis par defaut pour aceder au calls events
app.use("/api/event", eventRouter);
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const congesRoutes = require('./routes/congesRoutes');
app.use('/api/conges', congesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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
// Middleware de gestion d'erreurs (TOUJOURS EN DERNIER)
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Le Serveur de CoreFlow a démarré sur http://localhost:${PORT}`);
});

module.exports = app;
