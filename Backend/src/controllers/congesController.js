const congesService = require('../services/congesService');

// GET /api/conges
exports.getMyConges = async (req, res) => {
  try {
    let conges;

    if (req.user?.role?.toUpperCase() === 'RH' || req.user?.role?.toUpperCase() === 'ADMIN') {
      conges = await congesService.getAllConges();
    } else {
      conges = await congesService.getMyConges(req.user.id);
    }

    return res.status(200).json({
      success: true,
      data: conges
    });
  } catch (error) {
    console.error('Erreur getMyConges :', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de la récupération des congés"
    });
  }
};

// POST /api/conges
exports.createConge = async (req, res) => {
  try {

    const userId = req.user.id;

    const conge = await congesService.createConge(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Demande créée",
      data: conge
    });
  } catch (error) {
    console.error('Erreur createConge :', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de la création du congé"
    });
  }
};

// PUT /api/conges/:id/annuler
exports.annulerConge = async (req, res) => {
  try {

    const userId = req.user.id;
    const congeId = Number(req.params.id);

    const conge = await congesService.annulerConge(userId, congeId);

    return res.status(200).json({
      success: true,
      message: "Demande annulée avec succès",
      data: conge
    });
  } catch (error) {
    console.error('Erreur annulerConge :', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de l’annulation du congé"
    });
  }
};

exports.valider = async (req, res) => {
  try {
    const commentaire = req.body.commentaire || null;
    await congesService.valider(req.params.id, commentaire)
    return res.json({ message: "Congé validé" })
  } catch (error) {
    console.error('Erreur valider :', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de la validation du congé"
    });
  }
}

exports.refuser = async (req, res) => {
  try {
    const commentaire = req.body.commentaire || null;
    await congesService.refuser(req.params.id, commentaire)
    return res.json({ message: "Congé refusé" })
  } catch (error) {
    console.error('Erreur refuser :', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors du refus du congé"
    });
  }
}

exports.annulerValidation = async (req, res) => {
  try {
    await congesService.annulerValidation(req.params.id)
    return res.json({ message: "Validation annulée" })
  } catch (error) {
    console.error('Erreur annulerValidation :', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de l'annulation de la validation"
    });
  }
}

exports.annulerRefus = async (req, res) => {
  try {
    await congesService.annulerRefus(req.params.id)
    return res.json({ message: "Refus annulé" })
  } catch (error) {
    console.error('Erreur annulerRefus :', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de l'annulation du refus"
    });
  }
}

exports.getStats = async (req, res) => {
  try {
    const stats = await congesService.getStats()
    res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Erreur getStats :', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de la récupération des statistiques"
    });
  }
}


// GET /api/conges/solde
exports.getSoldeConges = async (req, res) => {
  try {
    const userId = req.user.id;

    const solde = await congesService.getSoldeConges(userId);

    return res.status(200).json({
      success: true,
      data: solde
    });

  } catch (error) {
    console.error('Erreur getSoldeConges :', error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de la récupération du solde"
    });
  }
};