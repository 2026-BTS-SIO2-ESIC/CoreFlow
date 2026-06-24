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

// Récupérer tous les congés (pour RH/ADMIN)
exports.findAllConges = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      c.id,
      c.user_id,
      u.nom,
      u.prenom,
      c.type_conge,
      c.date_debut,
      c.date_fin,
      c.nb_jours,
      c.motif,
      c.statut,
      c.commentaire_validateur,
      c.created_at
    FROM conges c
    JOIN utilisateurs u ON c.user_id = u.id
    ORDER BY c.created_at DESC
    `
  );

  return rows;
};

// Statistiques des congés
exports.getStats = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      COUNT(*) as total,
      SUM(statut = 'en_attente') as en_attente,
      SUM(statut = 'approuve') as valide,
      SUM(statut = 'refuse') as refuse,
      SUM(statut = 'annule') as annule
    FROM conges
    `
  );

  return rows[0];
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

// Incrémenter le quota RTT total (permet les bonus de 0.5)
exports.incrementRttTotal = async (userId, annee, nbJours) => {
  const [result] = await pool.query(
    `
    UPDATE soldes_conges
    SET rtt_total = rtt_total + ?
    WHERE user_id = ? AND annee = ?
    `,
    [nbJours, userId, annee]
  );

  return result;
};

// Décrémenter le quota RTT total
exports.decrementRttTotal = async (userId, annee, nbJours) => {
  const [result] = await pool.query(
    `
    UPDATE soldes_conges
    SET rtt_total = rtt_total - ?
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

// Mettre à jour statut + commentaire
exports.updateStatutWithComment = async (congeId, statut, commentaire) => {
  const [result] = await pool.query(
    `
    UPDATE conges
    SET statut = ?, commentaire_validateur = ?
    WHERE id = ?
    `,
    [statut, commentaire, congeId]
  );

  return result;
};

// Approuver un congé avec métadonnées de validation
exports.approveCongeWithComment = async (congeId, commentaire, validateurId) => {
  const [result] = await pool.query(
    `
    UPDATE conges
    SET statut = 'approuve', commentaire_validateur = ?, validateur_id = ?, date_validation = NOW()
    WHERE id = ?
    `,
    [commentaire, validateurId ?? null, congeId]
  );

  return result;
};

// Historique des validations approuvées d'un utilisateur
exports.findApprovedValidationDatesByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT date_validation
    FROM conges
    WHERE user_id = ?
      AND statut = 'approuve'
      AND date_validation IS NOT NULL
    ORDER BY date_validation ASC
    `,
    [userId]
  );

  return rows.map((row) => row.date_validation);
};

// Compter les refus d'un utilisateur
exports.countRefusedByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM conges
    WHERE user_id = ? AND statut = 'refuse'
    `,
    [userId]
  );

  return rows[0]?.total || 0;
};

// Annuler une validation (remettre en attente)
exports.cancelValidation = async (congeId) => {
  const [result] = await pool.query(
    `
    UPDATE conges
    SET statut = 'en_attente', commentaire_validateur = NULL
    WHERE id = ? AND statut = 'approuve'
    `,
    [congeId]
  );

  return result;
};

// Annuler un refus (remettre en attente)
exports.cancelRefus = async (congeId) => {
  const [result] = await pool.query(
    `
    UPDATE conges
    SET statut = 'en_attente', commentaire_validateur = NULL
    WHERE id = ? AND statut = 'refuse'
    `,
    [congeId]
  );

  return result;
};
