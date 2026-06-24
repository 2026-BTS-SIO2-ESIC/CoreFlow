const congesRepository = require('../repository/congesRepository');

const REFUS_REWARD_THRESHOLD = 3;
const REFUS_REWARD_DAYS = 0.5;
const APPROVAL_WINDOW_DAYS = 7;
const APPROVAL_THRESHOLD = 3;
const APPROVAL_COOLDOWN_DAYS = 14;

function findLatestApprovalThresholdDate(validationDates) {
    if (!Array.isArray(validationDates) || validationDates.length < APPROVAL_THRESHOLD) {
        return null;
    }

    const weekMs = APPROVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    let latestThresholdDate = null;

    for (let i = 0; i <= validationDates.length - APPROVAL_THRESHOLD; i += 1) {
        const firstDate = new Date(validationDates[i]);
        const thresholdDate = new Date(validationDates[i + APPROVAL_THRESHOLD - 1]);

        if (thresholdDate - firstDate <= weekMs) {
            latestThresholdDate = thresholdDate;
        }
    }

    return latestThresholdDate;
}

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

    const disponible = typeConge === 'rtt'
        ? solde.rtt_total - solde.rtt_pris
        : solde.conges_payes_total - solde.conges_payes_pris;

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

    return await congesRepository.findCongeById(result.insertId);
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

    return await congesRepository.findCongeById(congeId);
};

exports.getStats = async () => {
    return await congesRepository.getStats();
};

exports.getAllConges = async () => {
    return await congesRepository.findAllConges();
};

exports.valider = async (id, commentaire = null, validateurId = null) => {
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

    const approvalDates = await congesRepository.findApprovedValidationDatesByUserId(conge.user_id);
    const latestThresholdDate = findLatestApprovalThresholdDate(approvalDates);

    if (latestThresholdDate) {
        const cooldownEndDate = new Date(latestThresholdDate);
        cooldownEndDate.setDate(cooldownEndDate.getDate() + APPROVAL_COOLDOWN_DAYS);

        if (new Date() <= cooldownEndDate) {
            const error = new Error(
                `Cet employé a déjà ${APPROVAL_THRESHOLD} validations sur ${APPROVAL_WINDOW_DAYS} jours. ` +
                `Nouvelle validation autorisée après le ${cooldownEndDate.toLocaleDateString('fr-FR')}.`
            );
            error.statusCode = 400;
            throw error;
        }
    }

    const result = await congesRepository.approveCongeWithComment(id, commentaire, validateurId);
    if (result.affectedRows === 0) {
        const error = new Error('La demande ne peut pas être modifiée');
        error.statusCode = 400;
        throw error;
    }

    return await congesRepository.findCongeById(id);
};

exports.refuser = async (id, commentaire = null) => {
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

    const result = await congesRepository.updateStatutWithComment(id, 'refuse', commentaire);
    if (result.affectedRows === 0) {
        const error = new Error('La demande ne peut pas être modifiée');
        error.statusCode = 400;
        throw error;
    }

    const annee = new Date().getFullYear();

    // Restaurer le solde réservé lors de la création de la demande.
    if (conge.type_conge === 'rtt') {
        await congesRepository.decrementRttPris(conge.user_id, annee, conge.nb_jours);
    } else {
        await congesRepository.decrementCongesPayesPris(conge.user_id, annee, conge.nb_jours);
    }

    // Règle métier: chaque 3 refus, l'employé gagne 0.5 jour de RTT.
    const refusedCount = await congesRepository.countRefusedByUserId(conge.user_id);
    if (refusedCount > 0 && refusedCount % REFUS_REWARD_THRESHOLD === 0) {
        await congesRepository.incrementRttTotal(conge.user_id, annee, REFUS_REWARD_DAYS);
    }

    return await congesRepository.findCongeById(id);
};

// Annuler une validation (remettre en attente)
exports.annulerValidation = async (id) => {
    const conge = await congesRepository.findCongeById(id);
    if (!conge) {
        const error = new Error('Congé introuvable');
        error.statusCode = 404;
        throw error;
    }

    if (conge.statut !== 'approuve') {
        const error = new Error('La demande ne peut pas être annulée car elle n\'est pas approuvée');
        error.statusCode = 400;
        throw error;
    }

    const result = await congesRepository.cancelValidation(id);
    if (result.affectedRows === 0) {
        const error = new Error('La validation ne peut pas être annulée');
        error.statusCode = 400;
        throw error;
    }

    return await congesRepository.findCongeById(id);
};

// Annuler un refus (remettre en attente)
exports.annulerRefus = async (id) => {
    const conge = await congesRepository.findCongeById(id);
    if (!conge) {
        const error = new Error('Congé introuvable');
        error.statusCode = 404;
        throw error;
    }

    if (conge.statut !== 'refuse') {
        const error = new Error('La demande ne peut pas être annulée car elle n\'est pas refusée');
        error.statusCode = 400;
        throw error;
    }

    const refusedCountBeforeCancel = await congesRepository.countRefusedByUserId(conge.user_id);

    const result = await congesRepository.cancelRefus(id);
    if (result.affectedRows === 0) {
        const error = new Error('Le refus ne peut pas être annulé');
        error.statusCode = 400;
        throw error;
    }

    const annee = new Date().getFullYear();

    // Re-réserver le solde en remettant la demande en attente.
    if (conge.type_conge === 'rtt') {
        await congesRepository.incrementRttPris(conge.user_id, annee, conge.nb_jours);
    } else {
        await congesRepository.incrementCongesPayesPris(conge.user_id, annee, conge.nb_jours);
    }

    // Si le refus annulé faisait passer un palier multiple de 3, retirer le bonus associé.
    if (refusedCountBeforeCancel > 0 && refusedCountBeforeCancel % REFUS_REWARD_THRESHOLD === 0) {
        await congesRepository.decrementRttTotal(conge.user_id, annee, REFUS_REWARD_DAYS);
    }

    return await congesRepository.findCongeById(id);
};
