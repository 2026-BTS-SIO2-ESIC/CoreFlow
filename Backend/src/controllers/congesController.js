let conges = [
  {
    id: 1,
    id_utilisateur: 4,
    date_debut: "2026-03-01",
    date_fin: "2026-03-05",
    motif: "Vacances",
    statut: "EN_ATTENTE",
    date_demande: new Date().toISOString()
  }
];

// (temporaire) on simule l'utilisateur connecté
// plus tard: on prendra l'id via un vrai token + middleware
const FAKE_USER_ID = 4;
const { pool } = require('../config/database');

// GET /api/conges
exports.getMyConges = async (req, res) => {
  try {
    // Temporaire : utilisateur de test
    const userId = 4;

    const [rows] = await pool.query(
      `
      SELECT id, user_id, type_conge, date_debut, date_fin, nb_jours, motif, statut, created_at
      FROM conges
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Erreur getMyConges :', error.message);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des congés"
    });
  }
};

// POST /api/conges
exports.createConge = async (req, res) => {
  try {
    const { date_debut, date_fin, motif } = req.body;

    // Temporaire : utilisateur de test
    const userId = 4;

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
      SELECT id, user_id, type_conge, date_debut, date_fin, nb_jours, motif, statut, created_at
      FROM conges
      WHERE id = ?
      `,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Demande créée",
      data: rows[0]
    });
  } catch (error) {
    console.error('Erreur createConge :', error.message);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du congé"
    });
  }
};

exports.annulerConge = (req, res) => {
  const id = Number(req.params.id);

  const conge = conges.find(c => c.id === id);

  if (!conge) {
    return res.status(404).json({
      success: false,
      message: "Demande introuvable"
    });
  }

  if (conge.statut !== "EN_ATTENTE") {
    return res.status(400).json({
      success: false,
      message: "Seules les demandes en attente peuvent être annulées"
    });
  }

  conge.statut = "ANNULEE";

  return res.status(200).json({
    success: true,
    message: "Demande annulée avec succès",
    data: conge
  });
};