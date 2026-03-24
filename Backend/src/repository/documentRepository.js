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
    async findAllDocuments() {
        const sql = `SELECT
            d.id,
            d.titre,
            d.description,
            d.fichier_path,
            d.type_fichier,
            d.taille,
            d.cible_role,
            u.nom AS auteur_nom,
            u.prenom AS auteur_prenom
        FROM documents d
        INNER JOIN utilisateurs u ON d.auteur_id = u.id`;
        const [rows] = await db.query(sql);
    return rows;
    }
}

module.exports = new DocumentRepository();