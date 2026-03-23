const userRepository = require('../repository/userRepository');
const bcrypt = require('bcrypt');

function createServiceError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getAllUsers(filters) {
  return userRepository.getAllUsers(filters);
}

async function getUserById(id) {
  const user = await userRepository.getUserById(id);

  if (!user) {
    throw createServiceError(404, 'Utilisateur non trouve');
  }

  return user;
}

async function createUser(userData) {
  const { email, password, nom, prenom, role } = userData;

  if (!email || !password || !nom || !prenom || !role) {
    throw createServiceError(400, 'Email, mot de passe, nom, prenom et role sont requis');
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw createServiceError(400, 'Cet email est deja utilise');
  }

  return userRepository.createUser(userData);
}

async function updateUser(id, userData) {
  const existingUser = await userRepository.getUserById(id);
  if (!existingUser) {
    throw createServiceError(404, 'Utilisateur non trouve');
  }

  if (userData.email) {
    const emailCheck = await userRepository.findByEmailExcludingId(userData.email, id);
    if (emailCheck) {
      throw createServiceError(400, 'Cet email est deja utilise');
    }
  }

  const updatedUser = await userRepository.updateUser(id, userData);
  if (!updatedUser) {
    throw createServiceError(400, 'Aucune donnee a modifier');
  }

  return updatedUser;
}

async function toggleUserStatus(id) {
  const result = await userRepository.toggleUserStatus(id);

  if (!result) {
    throw createServiceError(404, 'Utilisateur non trouve');
  }

  return result;
}

async function deleteUser(id) {
  if (parseInt(id, 10) === 1) {
    throw createServiceError(403, 'Impossible de supprimer l\'administrateur principal');
  }

  const user = await userRepository.deleteUser(id);
  if (!user) {
    throw createServiceError(404, 'Utilisateur non trouve');
  }

  return user;
}

async function getInactiveUsers() {
  return userRepository.getInactiveUsers();
}

async function updatePassword(userId, oldPass, newPass) {
  const results = await userRepository.findPasswordById(userId);
  if (results.length === 0) {
    return { success: false, message: 'Utilisateur introuvable.' };
  }

  const passwordOk = await bcrypt.compare(oldPass, results[0].password);
  if (!passwordOk) {
    return { success: false, message: 'Mot de passe actuel incorrect.' };
  }

  await userRepository.updatePasswordById(userId, newPass);
  return { success: true };
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getInactiveUsers,
  updatePassword
};
