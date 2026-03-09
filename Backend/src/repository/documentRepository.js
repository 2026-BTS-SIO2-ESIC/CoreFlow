const db = require('../config/db');

class DocumentRepository {
    async createDocument(document) {
        const sql = 'INSERT INTO documents (titre, description, fichier_path, type_fichier,taille,cible_role,auteur_id,service_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [
            document.titre,
            document.description,
            document.fichier_path,
            document.type_fichier,
            document.taille,
            document.cible_role || 'Tous', // Par défaut, le document est accessible à tous les rôles
            document.auteur_id,
            document.service_id
        ];
        const [result] = await db.query(sql, values);
        return result.insertId;// Retourne l'ID du document créé
    }
}

module.exports = new DocumentRepository();