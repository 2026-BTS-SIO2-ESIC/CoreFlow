const db = require('../config/db');

class DocumentRepository {
    async createDocument(document) {
        const sql = 'INSERT INTO documents (titre, description, fichier_path, type_fichier, taille, cible_role, auteur_id, service_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
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
        return result.insertId; // Retourne l'ID du document créé
    }
    
    async findAllDocuments(userRole, userId) {
        // 1. On garde tes colonnes complètes (avec la consultation et le département)
        // et on utilise LEFT JOIN comme ton binôme pour éviter de cacher un doc si l'auteur est supprimé
        let sql = `SELECT
            d.id,
            d.titre,
            d.description,
            d.fichier_path,
            d.type_fichier,
            d.taille,
            d.cible_role,
            d.created_at,
            d.derniere_consultation,
            u.nom AS auteur_nom,
            u.prenom AS auteur_prenom,
            CASE d.service_id
                WHEN 1 THEN 'Informatique'
                WHEN 2 THEN 'Ressources Humaines'
                WHEN 3 THEN 'Commercial'
                ELSE 'Service inconnu'
            END AS service_nom
        FROM documents d
        LEFT JOIN utilisateurs u ON d.auteur_id = u.id
        WHERE 1=1`; // Le WHERE 1=1 permet d'ajouter facilement des conditions "AND" ensuite

        const params = [];
        const role = userRole.toLowerCase();

        if (role !== 'admin') {
            if (role === 'rh') {
                // Les RH voient les documents publics, les documents RH, ET leurs propres documents
                sql += ` AND (d.cible_role IN (?, ?, ?) OR d.auteur_id = ?)`;
                params.push('Tous', 'RH', 'rh', userId);
            } else if (role === 'manager') {
                // Les Managers voient les documents publics, les documents Manager, ET leurs propres documents
                sql += ` AND (d.cible_role IN (?, ?, ?) OR d.auteur_id = ?)`;
                params.push('Tous', 'Manager', 'manager', userId);
            } else {
                // Les employés normaux voient les documents publics ET leurs propres documents
                sql += ` AND (d.cible_role = ? OR d.auteur_id = ?)`;
                params.push('Tous', userId);
            }
        }

        sql += ` ORDER BY d.created_at DESC`;

        const [rows] = await db.query(sql, params);
        return rows;
    }
    async getDocumentById(id) {
        const sql = 'SELECT * FROM documents WHERE id = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0]; // Retourne le document ou undefined
    }

    async deleteDocument(id) {
        const sql = 'DELETE FROM documents WHERE id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }
    async updateLastConsultation(id) {
        const sql = 'UPDATE documents SET derniere_consultation = NOW() WHERE id = ?';
        const [result] = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }
    // Fonction pour mettre à jour un document en BDD
    async updateDocument(id, titre, description, cible_role) {
        // La requête SQL : on ajoute "derniere_consultation = NULL" pour réinitialiser la vue
        const query = `
            UPDATE documents 
            SET titre = ?, description = ?, cible_role = ?, derniere_consultation = NULL 
            WHERE id = ?
        `;
        // On exécute la requête
        const [result] = await db.query(query, [titre, description, cible_role, id]);
        return result.affectedRows > 0;
    }
}

module.exports = new DocumentRepository();