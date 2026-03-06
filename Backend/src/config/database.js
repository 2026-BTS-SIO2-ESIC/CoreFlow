const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Vide par défaut sur WAMP
  database: process.env.DB_NAME || 'coreflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fonction de test de connexion
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion MySQL réussie !');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion MySQL:', error.message);
    return false;
  }
}

module.exports = { pool, testConnection };