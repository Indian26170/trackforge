const jwt = require('jsonwebtoken');
const { RedisClient } = require('../config/redis');

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (await RedisClient.get(`bl_${token}`)) {
      return res.status(403).json({ error: 'Token has been revoked.' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Permission denied: Insufficient privileges.' });
  }
  next();
};

module.exports = { authenticateToken, authorizeRoles };