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
                u.nom,
                u.prenom,
                u.departement
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
                u.nom,
                u.prenom,
                u.departement
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
                u.nom,
                u.prenom,
                u.departement
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
            SELECT t.*, u.nom, u.prenom, u.departement
            FROM tickets t
            JOIN utilisateurs u ON t.demandeur_id = u.id
            WHERE t.demandeur_id = ?
            ORDER BY t.created_at DESC`;

        const [rows] = await pool.query(sql, [userId]);
        return rows;
    },

    // 6. Détails d'un ticket précis
    getById: async (idTicket) => {
        const sql = `
            SELECT t.*, u.nom, u.prenom, u.departement
            FROM tickets t
            JOIN utilisateurs u ON t.demandeur_id = u.id
            WHERE t.id = ?`;

        const [rows] = await pool.query(sql, [idTicket]);
        return rows[0];
    }
};

module.exports = TicketRepository;