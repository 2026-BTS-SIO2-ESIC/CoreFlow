const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) console.error("Erreur BDD:", err.message);
  else console.log("✅ MySQL Connecté");
});

module.exports = db; // On l'exporte !

// pour seulement lancer ce fichier je fais sur le terminal : node src/config/db.js