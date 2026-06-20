const request = require('supertest');
const app = require('../server'); // Vérifie que le chemin pointe bien vers ton fichier server.js

describe('Tests API Gestion Documentaire - POST /api/documents', () => {

  test('devrait retourner une erreur si on essaie d\'uploader sans joindre de fichier', async () => {
    // On simule une requête POST avec FormData (.field) mais sans fichier (.attach)
    const response = await request(app)
      .post('/api/documents')
      .field('titre', 'Rapport sans fichier')
      .field('description', 'Ceci est un test')
      .field('cible_role', 'Tous');

    // On s'attend à ce que l'API bloque la requête (Erreur 400 Bad Request ou 500)
    // Modifie le 400 par 500 si ton API renvoie une erreur 500 dans ce cas
    expect(response.statusCode).toBeGreaterThanOrEqual(400); 
  });

});