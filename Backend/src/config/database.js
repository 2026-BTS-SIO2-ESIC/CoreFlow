const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "", // Vide par défaut sur WAMP
  database: process.env.DB_NAME || "coreflow",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fonction de test de connexion
async function testConnection() {
  return new Promise((resolve) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("❌ Erreur connexion MySQL:", err.message);
        return resolve(false);
      }
      console.log("✅ Connexion MySQL réussie !");
      connection.release();
      resolve(true);
    });
  });
}

module.exports = { pool, testConnection, query: pool.query.bind(pool) };
