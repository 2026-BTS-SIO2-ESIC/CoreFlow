const { pool } = require('../config/database');

const TicketRepository = {
    // 1. Créer un nouveau ticket
    create: async (ticketData) => {
        const sql = `INSERT INTO tickets 
            (titre, description, categorie, statut, priorite, demandeur_id) 
            VALUES (?, ?, ?, ?, ?, ?)`;

        const values = [
            ticketData.titre,
            ticketData.description,
            ticketData.categorie || "Informatique",
            "ouvert",
            "normale",
            ticketData.demandeur_id,
        ];

        const [result] = await pool.query(sql, values);
        return result.insertId;
    },

    // 2. Liste de TOUS les tickets (Admin)
    getAllTickets: async () => {
        const [rows] = await pool.query(
            `SELECT
                t.id,
                t.titre,
                t.description,
                t.categorie,
                t.statut,
                t.demandeur_id,
                t.assigne_a_id,
                t.created_at,
                t.updated_at,
                u.nom AS demandeur_nom,
                u.prenom AS demandeur_prenom,
                u.departement AS demandeur_departement
            FROM tickets t
            JOIN utilisateurs u ON t.demandeur_id = u.id
            ORDER BY t.id ASC`
        );
        return rows;
    },

    // 3. Liste des tickets IT
    getItTickets: async () => {
        const [rows] = await pool.query(
            `SELECT
                t.id,
                t.titre,
                t.description,
                t.statut,
                t.demandeur_id,
                t.created_at,
                t.updated_at,
                u.nom AS demandeur_nom,
                u.prenom AS demandeur_prenom,
                u.departement AS demandeur_departement
            FROM tickets t
            JOIN utilisateurs u ON t.demandeur_id = u.id
            WHERE t.categorie = 'it'
            ORDER BY t.id ASC`
        );
        return rows;
    },

    // 4. Liste des tickets RH
    getRhTickets: async () => {
        const [rows] = await pool.query(
            `SELECT
                t.id,
                t.titre,
                t.description,
                t.statut,
                t.demandeur_id,
                t.created_at,
                t.updated_at,
                u.nom AS demandeur_nom,
                u.prenom AS demandeur_prenom,
                u.departement AS demandeur_departement
            FROM tickets t
            JOIN utilisateurs u ON t.demandeur_id = u.id
            WHERE t.categorie = 'rh'
            ORDER BY t.id ASC`
        );
        return rows;
    },

    // 5. Récupérer les tickets d'un utilisateur spécifique (Client)
    getByUserId: async (userId) => {
        const sql = `
            SELECT
                t.id,
                t.titre,
                t.description,
                t.categorie,
                t.statut,
                t.priorite,
                t.demandeur_id,
                t.assigne_a_id,
                t.created_at,
                t.updated_at,
                d.nom AS demandeur_nom,
                d.prenom AS demandeur_prenom,
                d.departement AS demandeur_departement,
                a.nom AS assigne_nom,
                a.prenom AS assigne_prenom,
                a.departement AS assigne_departement
            FROM tickets t
            JOIN utilisateurs d ON t.demandeur_id = d.id
            LEFT JOIN utilisateurs a ON t.assigne_a_id = a.id
            WHERE t.demandeur_id = ? OR t.assigne_a_id = ?
            ORDER BY t.created_at DESC`;

        const [rows] = await pool.query(sql, [userId, userId]);
        return rows;
    },

    // 6. Détails d'un ticket précis
    getById: async (idTicket) => {
        const sql = `
            SELECT t.*, u.nom AS demandeur_nom, u.prenom AS demandeur_prenom, u.departement AS demandeur_departement
            FROM tickets t
            JOIN utilisateurs u ON t.demandeur_id = u.id
            WHERE t.id = ?`;

        const [rows] = await pool.query(sql, [idTicket]);
        return rows[0];
    },

    // 7. Prise en charge du ticket (mise à jour de assigne_a_id et statut)
    takeCharge: async (ticketId, userId) => {
        const sql = `UPDATE tickets SET assigne_a_id = ?, statut = 'en_cours', updated_at = NOW() WHERE id = ? AND assigne_a_id IS NULL`;
        const [result] = await pool.query(sql, [userId, ticketId]);
        return result.affectedRows > 0; // Retourne true si la mise à jour a réussi
    },

    // 8. Marquer le ticket comme résolu (mise à jour du statut)
    isResolved: async (ticketId, userId) => {
        const sql = 'UPDATE tickets SET statut = "resolu", updated_at = NOW() WHERE id = ? AND assigne_a_id = ?';
        const [result] = await pool.query(sql, [ticketId, userId]);
        return result.affectedRows > 0; // Retourne true si la mise à jour a réussi
    },

    // 9. Supprimer un ticket
    DeleteTicket: async (ticketId) => {
        const sql = 'DELETE FROM tickets WHERE id = ?';
        const [result] = await pool.query(sql, [ticketId]);
        return result.affectedRows > 0; // Retourne true si la suppression a réussi
    },
};

module.exports = TicketRepository;