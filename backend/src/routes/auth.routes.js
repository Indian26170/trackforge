const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/prisma');
const { RedisClient } = require('../config/redis');
const validate = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');
const { signAccess, signRefresh } = require('../utils/tokens');

const REFRESH_TTL = 7 * 24 * 60 * 60;

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  maxAge: REFRESH_TTL * 1000,
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const publicUser = (u) => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role });

router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, fullName } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ error: 'Email already registered.' });

  const user = await prisma.user.create({
    data: { email, fullName, passwordHash: await bcrypt.hash(password, 12) },
  });
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  const valid = user && (await bcrypt.compare(req.body.password, user.passwordHash));
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

  const refreshToken = signRefresh(user);
  await RedisClient.set(`rt_${user.id}`, refreshToken, 'EX', REFRESH_TTL);
  res.cookie('refreshToken', refreshToken, cookieOpts);
  res.json({ accessToken: signAccess(user), user: publicUser(user) });
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token.' });

  try {
    const { id } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if ((await RedisClient.get(`rt_${id}`)) !== token) {
      return res.status(401).json({ error: 'Refresh token revoked.' });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(401).json({ error: 'User not found.' });

    res.json({ accessToken: signAccess(user), user: publicUser(user) });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token.' });
  }
});

router.post('/logout', authenticateToken, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const ttl = Math.max(req.user.exp - Math.floor(Date.now() / 1000), 1);

  await RedisClient.set(`bl_${token}`, '1', 'EX', ttl);
  await RedisClient.del(`rt_${req.user.id}`);
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out.' });
});

router.get('/me', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ user: publicUser(user) });
});

router.get('/users', authenticateToken, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, role: true },
    orderBy: { fullName: 'asc' },
  });
  res.json({ users });
});

module.exports = router;