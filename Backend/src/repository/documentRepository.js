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
            d.created_at,
            u.nom AS auteur_nom,
            u.prenom AS auteur_prenom,
            u.departement AS service_nom
        FROM documents d
        INNER JOIN utilisateurs u ON d.auteur_id = u.id`;
        const [rows] = await db.query(sql);
    return rows;
    }
    async getDocumentById(id) {         
    const query = 'SELECT * FROM documents WHERE id = ?';         
    const [rows] = await db.query(query, [id]);         
    return rows[0]; // Renvoie le document s'il existe, sinon undefined    
    }     
    // Supprimer la ligne en BDD
    async deleteDocument(id) {         
        const query = 'DELETE FROM documents WHERE id = ?';         
        const [result] = await db.query(query, [id]); 
        return result.affectedRows; // Renvoie 1 si supprimé, 0 si non trouvé 
        }
        
}

module.exports = new DocumentRepository();