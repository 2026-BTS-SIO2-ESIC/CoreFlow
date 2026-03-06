const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(
    { userId: user.id, role: user.role },
    secret,
    { expiresIn: '24h' }
  );
};

const login = async (email, password) => {
  const results = await authRepository.findUserByEmailAndPassword(email, password);
  if (results.length === 0) return null;

  const user = results[0];
  const token = generateToken(user);
  const { password: _password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

const getMe = async (userId) => {
  const results = await authRepository.findUserById(userId);
  if (results.length === 0) return null;

  const { password: _password, ...userWithoutPassword } = results[0];
  return userWithoutPassword;
};

module.exports = { login, getMe };
