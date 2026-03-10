const { pool } = require('../config/database');

// Temporaire : utilisateur connecté simulé
// Plus tard, on remplacera ça par req.user.id via middleware d'auth
const FAKE_USER_ID = 4;

// GET /api/conges
exports.getMyConges = async (req, res) => {
  try {
    const userId = FAKE_USER_ID;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        user_id,
        type_conge,
        date_debut,
        date_fin,
        nb_jours,
        motif,
        statut,
        commentaire_validateur,
        created_at
      FROM conges
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Erreur getMyConges :', error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des congés"
    });
  }
};

// POST /api/conges
exports.createConge = async (req, res) => {
  try {
    const { date_debut, date_fin, motif } = req.body;
    const userId = FAKE_USER_ID;

    if (!date_debut || !date_fin) {
      return res.status(400).json({
        success: false,
        message: "date_debut et date_fin sont obligatoires"
      });
    }

    const debut = new Date(date_debut);
    const fin = new Date(date_fin);

    if (fin < debut) {
      return res.status(400).json({
        success: false,
        message: "La date de fin doit être après la date de début"
      });
    }

    // Calcul simple en jours calendaires
    const diffMs = fin - debut;
    const nbJours = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    const [result] = await pool.query(
      `
      INSERT INTO conges (
        user_id,
        type_conge,
        date_debut,
        date_fin,
        nb_jours,
        motif,
        statut
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        'rtt',
        date_debut,
        date_fin,
        nbJours,
        motif || null,
        'en_attente'
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        user_id,
        type_conge,
        date_debut,
        date_fin,
        nb_jours,
        motif,
        statut,
        commentaire_validateur,
        created_at
      FROM conges
      WHERE id = ?
      `,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Demande créée",
      data: rows[0]
    });
  } catch (error) {
    console.error('Erreur createConge :', error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du congé"
    });
  }
};

// PUT /api/conges/:id/annuler
exports.annulerConge = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = FAKE_USER_ID;

    const [rows] = await pool.query(
      `
      SELECT id, user_id, statut
      FROM conges
      WHERE id = ? AND user_id = ?
      `,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Demande introuvable"
      });
    }

    const conge = rows[0];

    if (conge.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: "Seules les demandes en attente peuvent être annulées"
      });
    }

    await pool.query(
      `
      UPDATE conges
      SET statut = ?, commentaire_validateur = ?
      WHERE id = ?
      `,
      ['annule', 'Annulé par l’utilisateur', id]
    );

    const [updatedRows] = await pool.query(
      `
      SELECT 
        id,
        user_id,
        type_conge,
        date_debut,
        date_fin,
        nb_jours,
        motif,
        statut,
        commentaire_validateur,
        created_at
      FROM conges
      WHERE id = ?
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Demande annulée avec succès",
      data: updatedRows[0]
    });
  } catch (error) {
    console.error('Erreur annulerConge :', error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l’annulation du congé"
    });
  }
};

// GET /api/conges/solde
exports.getSoldeConges = async (req, res) => {
  try {
    const userId = FAKE_USER_ID;

    const [rows] = await pool.query(
      `
      SELECT 
        conges_payes_total,
        conges_payes_pris,
        rtt_total,
        rtt_pris
      FROM soldes_conges
      WHERE user_id = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Solde de congés introuvable"
      });
    }

    const solde = rows[0];

    const conges_restants = solde.conges_payes_total - solde.conges_payes_pris;
    const rtt_restants = solde.rtt_total - solde.rtt_pris;

    return res.status(200).json({
      success: true,
      data: {
        conges_payes_total: solde.conges_payes_total,
        conges_payes_pris: solde.conges_payes_pris,
        conges_restants,
        rtt_total: solde.rtt_total,
        rtt_pris: solde.rtt_pris,
        rtt_restants
      }
    });

  } catch (error) {
    console.error('Erreur getSoldeConges :', error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du solde"
    });
  }
};