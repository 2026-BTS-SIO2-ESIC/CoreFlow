const authService = require('../services/authService');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email et mot de passe requis" });
  }

  try {
    const result = await authService.login(email, password);
    if (!result) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
    }
    res.status(200).json({ success: true, message: "Connexion réussie", data: result });
  } catch (err) {
    console.error("Erreur login:", err.message);
    res.status(500).json({ success: false, error: "Erreur interne du serveur" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("Erreur getMe:", err.message);
    res.status(500).json({ success: false, error: "Erreur interne du serveur" });
  }
};
