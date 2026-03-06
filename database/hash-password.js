/**
 * CoreFlow - Script de hashage des mots de passe
 * À exécuter UNE SEULE FOIS après l'import de coreflow_database.sql
 *
 * Usage : node hash-passwords.js
 * Prérequis : npm install bcrypt mysql2 dotenv
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql  = require('mysql2/promise');

const SALT_ROUNDS = 10;

// Mots de passe en clair des comptes de test
const accounts = [
  { email: 'admin@coreflow.fr',   password: '@dmiN1234'    },
  { email: 'rh@coreflow.fr',      password: 'Rh_1234'      },
  { email: 'manager@coreflow.fr', password: 'Manager_1234' },
  { email: 'employe@coreflow.fr', password: 'Employe_1234' },
];

async function main() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'coreflow',
  });

  console.log('✅ Connecté à la base de données\n');

  for (const account of accounts) {
    const hash = await bcrypt.hash(account.password, SALT_ROUNDS);
    await db.execute(
      'UPDATE utilisateurs SET password = ? WHERE email = ?',
      [hash, account.email]
    );
    console.log(`🔒 ${account.email} → mot de passe hashé`);
  }

  await db.end();
  console.log('\n✅ Tous les mots de passe ont été hashés avec succès !');
}

main().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});