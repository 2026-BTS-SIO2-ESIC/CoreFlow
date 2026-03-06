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

// GET /api/conges
exports.getMyConges = (req, res) => {
  const mesConges = conges.filter(c => c.id_utilisateur === FAKE_USER_ID);
  res.status(200).json({
    success: true,
    data: mesConges
  });
};

// POST /api/conges
exports.createConge = (req, res) => {
  const { date_debut, date_fin, motif } = req.body;

  if (!date_debut || !date_fin) {
    return res.status(400).json({
      success: false,
      message: "date_debut et date_fin sont obligatoires"
    });
  }

  if (new Date(date_fin) < new Date(date_debut)) {
    return res.status(400).json({
      success: false,
      message: "date_fin doit être après date_debut"
    });
  }

  const newConge = {
    id: Date.now(),
    id_utilisateur: FAKE_USER_ID,
    date_debut,
    date_fin,
    motif: motif || null,
    statut: "EN_ATTENTE",
    date_demande: new Date().toISOString()
  };

  conges.unshift(newConge);

  res.status(201).json({
    success: true,
    message: "Demande créée",
    data: newConge
  });
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