const { pool } = require('../config/database');

// Récupérer tous les congés d'un utilisateur
exports.findCongesByUserId = async (userId) => {
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

  return rows;
};

// Récupérer le solde d'un utilisateur pour une année
exports.findSoldeByUserIdAndYear = async (userId, annee) => {
  const [rows] = await pool.query(
    `
    SELECT 
      conges_payes_total,
      conges_payes_pris,
      rtt_total,
      rtt_pris,
      annee
    FROM soldes_conges
    WHERE user_id = ? AND annee = ?
    `,
    [userId, annee]
  );

  return rows[0] || null;
};

// Récupérer le solde utilisateur (sans année)
// utile pour reproduire exactement ton getSoldeConges actuel
exports.findSoldeByUserId = async (userId) => {
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

  return rows[0] || null;
};

// Créer une demande de congé
exports.createConge = async ({
  userId,
  typeConge,
  dateDebut,
  dateFin,
  nbJours,
  motif,
  statut
}) => {
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
    [userId, typeConge, dateDebut, dateFin, nbJours, motif, statut]
  );

  return result;
};

// Récupérer un congé par son id
exports.findCongeById = async (congeId) => {
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
    [congeId]
  );

  return rows[0] || null;
};

// Récupérer un congé par son id et son user_id
exports.findCongeByIdAndUserId = async (congeId, userId) => {
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
    WHERE id = ? AND user_id = ?
    `,
    [congeId, userId]
  );

  return rows[0] || null;
};

// Incrémenter le nombre de RTT pris
exports.incrementRttPris = async (userId, annee, nbJours) => {
  const [result] = await pool.query(
    `
    UPDATE soldes_conges
    SET rtt_pris = rtt_pris + ?
    WHERE user_id = ? AND annee = ?
    `,
    [nbJours, userId, annee]
  );

  return result;
};

// Décrémenter le nombre de RTT pris
exports.decrementRttPris = async (userId, annee, nbJours) => {
  const [result] = await pool.query(
    `
    UPDATE soldes_conges
    SET rtt_pris = rtt_pris - ?
    WHERE user_id = ? AND annee = ?
    `,
    [nbJours, userId, annee]
  );

  return result;
};

// Incrémenter le nombre de congés payés pris
exports.incrementCongesPayesPris = async (userId, annee, nbJours) => {
  const [result] = await pool.query(
    `
    UPDATE soldes_conges
    SET conges_payes_pris = conges_payes_pris + ?
    WHERE user_id = ? AND annee = ?
    `,
    [nbJours, userId, annee]
  );

  return result;
};

// Décrémenter le nombre de congés payés pris
exports.decrementCongesPayesPris = async (userId, annee, nbJours) => {
  const [result] = await pool.query(
    `
    UPDATE soldes_conges
    SET conges_payes_pris = conges_payes_pris - ?
    WHERE user_id = ? AND annee = ?
    `,
    [nbJours, userId, annee]
  );

  return result;
};

// Annuler un congé avec commentaire
exports.cancelConge = async (congeId, commentaire) => {
  const [result] = await pool.query(
    `
    UPDATE conges
    SET statut = ?, commentaire_validateur = ?
    WHERE id = ?
    `,
    ['annule', commentaire, congeId]
  );

  return result;
};

exports.findOverlappingCongeByUserId = async (userId, dateDebut, dateFin) => {
  const [rows] = await pool.query(
    `
    SELECT 
      id,
      date_debut,
      date_fin,
      statut
    FROM conges
    WHERE user_id = ?
      AND statut IN ('en_attente', 'approuve')
      AND date_debut <= ?
      AND date_fin >= ?
    LIMIT 1
    `,
    [userId, dateFin, dateDebut]
  );

  return rows[0] || null;
};