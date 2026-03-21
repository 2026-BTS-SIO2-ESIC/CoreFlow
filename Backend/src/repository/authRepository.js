const { pool } = require('../config/database');

async function findUserByEmail(email) {
  const [users] = await pool.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
  return users[0] || null;
}

async function findUserById(id) {
  const [users] = await pool.query('SELECT * FROM utilisateurs WHERE id = ?', [id]);
  return users[0] || null;
}

module.exports = {
  findUserByEmail,
  findUserById,
};