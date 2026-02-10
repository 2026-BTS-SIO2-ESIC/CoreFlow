const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Erreur connexion DB :", err.message);
  } else {
    console.log("✅ Connecté à la base de données CoreFlow");
    connection.release();
  }
});

module.exports = db;
