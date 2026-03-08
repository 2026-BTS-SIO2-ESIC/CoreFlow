const db = require('../config/db');

class DocumentRepository {
    async createDocument(document) {
        const sql = 'INSERT INTO documents (titre, description, chemin_fichier, type_mime,taille,cible_role,idUtilisateurs,idServices) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [
            document.titre,
            document.description,
            document.chemin_fichier,
            document.type_mime,
            document.taille,
            document.cible_role || 'Tous', // Par défaut, le document est accessible à tous les rôles
            document.idUtilisateurs,
            document.idServices
        ];
        const [result] = await db.query(sql, values);
        return result.insertId;// Retourne l'ID du document créé
    }
}

module.exports = new DocumentRepository();