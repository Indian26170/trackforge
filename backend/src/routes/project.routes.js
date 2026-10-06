const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../config/prisma');
const validate = require('../middleware/validate');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

const projectSchema = z.object({
  key: z.string().regex(/^[A-Z]{2,10}$/, 'Key must be 2-10 uppercase letters'),
  name: z.string().min(2).max(150),
});

router.get('/', async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { id: true, key: true, name: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ projects });
});

router.post('/', authorizeRoles('ADMIN', 'DEVELOPER'), validate(projectSchema), async (req, res) => {
  const taken = await prisma.project.findUnique({ where: { key: req.body.key } });
  if (taken) return res.status(400).json({ error: 'Project key already exists.' });

  const project = await prisma.project.create({ data: { ...req.body, ownerId: req.user.id } });
  res.status(201).json({ project });
});

router.delete('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  await prisma.project.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  res.status(204).end();
});

module.exports = router;