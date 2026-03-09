const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

const getAllUsers = async () => {
  return await userRepository.getAllUsers();
};

const getAllUsersAdmin = async () => {
  return await userRepository.getAllUsersAdmin();
};

const updatePassword = async (userId, oldPass, newPass) => {
  const results = await userRepository.findPasswordById(userId);
  if (results.length === 0) return { success: false, message: 'Utilisateur introuvable.' };
  const passwordOk = await bcrypt.compare(oldPass, results[0].password);
  if (!passwordOk) return { success: false, message: 'Mot de passe actuel incorrect.' };
  await userRepository.updatePasswordById(userId, newPass);
  return { success: true };
};

module.exports = { getAllUsers, getAllUsersAdmin, updatePassword };
