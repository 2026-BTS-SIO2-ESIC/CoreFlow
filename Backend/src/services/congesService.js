const congesRepository = require('../repository/congesRepository');

// Récupérer les congés d'un utilisateur
exports.getMyConges = async (userId) => {
  return await congesRepository.findCongesByUserId(userId);
};

// Récupérer le solde d'un utilisateur
exports.getSoldeConges = async (userId) => {
  const solde = await congesRepository.findSoldeByUserId(userId);

  if (!solde) {
    const error = new Error('Solde de congés introuvable');
    error.statusCode = 404;
    throw error;
  }

  const conges_restants = solde.conges_payes_total - solde.conges_payes_pris;
  const rtt_restants = solde.rtt_total - solde.rtt_pris;

  return {
    conges_payes_total: solde.conges_payes_total,
    conges_payes_pris: solde.conges_payes_pris,
    conges_restants,
    rtt_total: solde.rtt_total,
    rtt_pris: solde.rtt_pris,
    rtt_restants
  };
};

// Créer une demande de congé
exports.createConge = async (userId, congeData) => {
  const { date_debut, date_fin, motif } = congeData;
  const typeConge = 'rtt'; // volontairement fixé pour l'instant

  if (!date_debut || !date_fin) {
    const error = new Error('date_debut et date_fin sont obligatoires');
    error.statusCode = 400;
    throw error;
  }

  const debut = new Date(date_debut);
  const fin = new Date(date_fin);

  if (fin < debut) {
    const error = new Error('La date de fin doit être après la date de début');
    error.statusCode = 400;
    throw error;
  }

  // Calcul simple en jours calendaires
  const diffMs = fin - debut;
  const nbJours = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  const annee = new Date().getFullYear();

  const congeChevauchant = await congesRepository.findOverlappingCongeByUserId(
    userId,
    date_debut,
    date_fin
  );

  if (congeChevauchant) {
    const error = new Error(
      'Une demande de congé existe déjà sur cette période (en attente ou approuvée)'
    );
    error.statusCode = 400;
    throw error;
  }

  const solde = await congesRepository.findSoldeByUserIdAndYear(userId, annee);

  if (!solde) {
    const error = new Error('Solde de congés introuvable');
    error.statusCode = 404;
    throw error;
  }

  let disponible = 0;

  if (typeConge === 'rtt') {
    disponible = solde.rtt_total - solde.rtt_pris;
  } else {
    disponible = solde.conges_payes_total - solde.conges_payes_pris;
  }

  if (nbJours > disponible) {
    const error = new Error(`Solde insuffisant : il vous reste ${disponible} jour(s)`);
    error.statusCode = 400;
    throw error;
  }

  const result = await congesRepository.createConge({
    userId,
    typeConge,
    dateDebut: date_debut,
    dateFin: date_fin,
    nbJours,
    motif: motif || null,
    statut: 'en_attente'
  });

  if (typeConge === 'rtt') {
    await congesRepository.incrementRttPris(userId, annee, nbJours);
  } else {
    await congesRepository.incrementCongesPayesPris(userId, annee, nbJours);
  }

  const conge = await congesRepository.findCongeById(result.insertId);

  return conge;
};

// Annuler une demande de congé
exports.annulerConge = async (userId, congeId) => {
  const conge = await congesRepository.findCongeByIdAndUserId(congeId, userId);

  if (!conge) {
    const error = new Error('Demande introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (conge.statut !== 'en_attente') {
    const error = new Error('Seules les demandes en attente peuvent être annulées');
    error.statusCode = 400;
    throw error;
  }

  await congesRepository.cancelConge(congeId, 'Annulé par l’utilisateur');

  const annee = new Date().getFullYear();

  if (conge.type_conge === 'rtt') {
    await congesRepository.decrementRttPris(userId, annee, conge.nb_jours);
  } else {
    await congesRepository.decrementCongesPayesPris(userId, annee, conge.nb_jours);
  }

  const updatedConge = await congesRepository.findCongeById(congeId);

  return updatedConge;
};

exports.getStats = async () => {
  const stats = await congesRepository.getStats();
  return stats;
};

exports.getAllConges = async () => {
  return await congesRepository.findAllConges();
};

exports.valider = async (id) => {
  const conge = await congesRepository.findCongeById(id);
  if (!conge) {
    const error = new Error('Congé introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (conge.statut !== 'en_attente') {
    const error = new Error('La demande ne peut pas être traitée car elle n\'est plus en attente');
    error.statusCode = 400;
    throw error;
  }

  const result = await congesRepository.updateStatut(id, 'approuve');
  if (result.affectedRows === 0) {
    const error = new Error('La demande ne peut pas être modifiée');
    error.statusCode = 400;
    throw error;
  }

  return await congesRepository.findCongeById(id);
};

exports.refuser = async (id) => {
  const conge = await congesRepository.findCongeById(id);
  if (!conge) {
    const error = new Error('Congé introuvable');
    error.statusCode = 404;
    throw error;
  }

  if (conge.statut !== 'en_attente') {
    const error = new Error('La demande ne peut pas être traitée car elle n\'est plus en attente');
    error.statusCode = 400;
    throw error;
  }

  const result = await congesRepository.updateStatut(id, 'refuse');
  if (result.affectedRows === 0) {
    const error = new Error('La demande ne peut pas être modifiée');
    error.statusCode = 400;
    throw error;
  }

  return await congesRepository.findCongeById(id);
};