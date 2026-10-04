const jwt = require('jsonwebtoken');

const signAccess = (user) =>
  jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });

const signRefresh = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

module.exports = { signAccess, signRefresh };