const mysql = require("mysql2/promise");
const mysqlCallback = require("mysql2");

const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "coreflow",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(poolConfig);
const db = mysqlCallback.createPool(poolConfig);

// Fonction de test de connexion
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connexion MySQL réussie !");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Erreur connexion MySQL:", error.message);
    return false;
  }
}
// db pour features evenements
// pool pour features auth
module.exports = { pool, db, testConnection };
