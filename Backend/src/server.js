// On importe la bibliothèque Express
const express = require('express');

//IMPORT ET UTILISATION DE CORS POUR PERMETTRE LES REQUETES CROSS-ORIGIN
const cors = require('cors');
 
// On crée une application Express
const app = express();
 
const { json } = require ('express');
app.use(cors());
app.use(json());
 
// On définit un port d'écoute pour le serveur
const PORT = 3000;
 
// On crée une route GET pour la racine du serveur
app.get('/', (req, res) => {
  res.send('🫵🏾🫵🏾 Serveur Node.JS opérationnel 🫵🏾🫵🏾👌');
});
 
// On crée une route(endpoint) GET pour /api/test
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Bonjour depuis l\'API: Test réussie !', //Message de test
  version: '1.0.0', //Version de l'API
  status: 'Opérationnel', //Statut de l'API
  });
});
 
// On crée une route(endpoint) GET pour /api/info
app.get('/api/info', (req, res) => {
  res.json({
    app: 'CoreFlow',
    auteur: 'Volmy',
    rôles: ['employée', 'manager', 'rh', 'IT', 'admin'],
  });
});
 
const db = require('./config/database'); // Importation du pool de connexions à la base de données
 
//on creer un endpoin API pour tester la connexion à la base de données
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS currentTime'); // Requête pour obtenir l'heure actuelle de la base de données
    res.json({ databaseTime: rows[0].currentTime }); // Envoi de l'heure actuelle en réponse
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    res.status(500).json({ error: 'Erreur de connexion à la base de données' }); // Envoi d'une erreur en cas de problème de connexion
  }
});
 
// on crée un endpoint API pour récupérer la liste des utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, Prenom, Nom, Email, Mot_de_passe, role, actif, Date_creation FROM users'); // Requête pour obtenir la liste des utilisateurs
    res.json(rows); // Envoi de la liste des utilisateurs en réponse
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' }); // Envoi d'une erreur en cas de problème
  }
});
 
//on crée un endpoint API pour récupérer la liste des evenements et afficher seuelemnt ceux avenirs
app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, Titre, Description, Date_debut, Date_fin, Lieu, organisateur_id FROM evenements WHERE Date_debut >= NOW() ORDER BY Date_debut ASC'); // Requête pour obtenir la liste des événements à venir
    res.json(rows); // Envoi de la liste des événements en réponse
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' }); // Envoi d'une erreur en cas de problème
  }
});
 
//on crée un endpoint API pour récupérer la liste des evenements et afficher seuelemnt ceux passers
app.get('/api/P-events', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, Titre, Description, Date_debut, Date_fin, Lieu, organisateur_id FROM evenements WHERE Date_debut <= NOW() ORDER BY Date_debut ASC'); // Requête pour obtenir la liste des événements à venir
    res.json(rows); // Envoi de la liste des événements en réponse
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' }); // Envoi d'une erreur en cas de problème
  }
});
 
 
// On démarre le serveur et on écoute sur le port défini
app.listen(PORT, () => {
  console.log(`Le serveur démarre sur http://localhost:${PORT}`);
});
