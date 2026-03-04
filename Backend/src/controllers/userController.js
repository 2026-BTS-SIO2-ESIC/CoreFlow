const userService = require('../services/userService');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("Erreur getAllUsers:", err.message);
    res.status(500).json({ success: false, error: "Erreur interne du serveur" });
  }
};

exports.getAllUsersAdmin = async (req, res) => {
  try {
    const users = await userService.getAllUsersAdmin();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("Erreur getAllUsersAdmin:", err.message);
    res.status(500).json({ success: false, error: "Erreur interne du serveur" });
  }
};

exports.updatePassword = async (req, res) => {
  const userId = req.user.userId;
  const { oldPass, newPass } = req.body;

  if (!oldPass || !newPass) {
    return res.status(400).json({ success: false, message: 'Champs manquants.' });
  }

  try {
    const result = await userService.updatePassword(userId, oldPass, newPass);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    res.status(200).json({ success: true, message: 'Mot de passe mis à jour.' });
  } catch (err) {
    console.error("Erreur updatePassword:", err.message);
    res.status(500).json({ success: false, error: "Erreur interne du serveur" });
  }
};
