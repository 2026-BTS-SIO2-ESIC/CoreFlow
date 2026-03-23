const service = require("../services/congeService");

exports.getPending = async (req, res) => {
  try {
    const data = await service.getPending();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.valider = async (req, res) => {
  await service.valider(req.params.id);
  res.json({ message: "Congé validé" });
};

exports.refuser = async (req, res) => {
  await service.refuser(req.params.id);
  res.json({ message: "Congé refusé" });
};

exports.countPending = async (req, res) => {
  const total = await service.getCountPending();
  res.json({ total });
};