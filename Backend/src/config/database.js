require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'coreflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test de connexion
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Erreur connexion DB :", err.message);
  } else {
    console.log("✅ Connecté à la base de données CoreFlow");
    connection.release();
  }
});

module.exports = db;
