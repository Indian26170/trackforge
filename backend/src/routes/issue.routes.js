const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../config/prisma');
const validate = require('../middleware/validate');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { canMove } = require('../utils/workflow');

router.use(authenticateToken);

const include = {
  assignee: { select: { id: true, fullName: true } },
  reporter: { select: { id: true, fullName: true } },
};

const createSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  type: z.enum(['BUG', 'FEATURE', 'CHORE', 'EPIC']).default('BUG'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assigneeId: z.string().uuid().nullable().optional(),
});

const statusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
});

router.get('/', async (req, res) => {
  const { projectId } = req.query;
  const issues = await prisma.issue.findMany({
    where: { deletedAt: null, ...(projectId && { projectId }) },
    include,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ issues });
});

router.post('/', authorizeRoles('ADMIN', 'DEVELOPER'), validate(createSchema), async (req, res) => {
  const { projectId, ...data } = req.body;

  const issue = await prisma.$transaction(async (tx) => {
    const project = await tx.project.update({
      where: { id: projectId },
      data: { issueCounter: { increment: 1 } },
    });
    return tx.issue.create({
      data: {
        ...data,
        projectId,
        issueKey: `${project.key}-${project.issueCounter}`,
        reporterId: req.user.id,
      },
      include,
    });
  });

  res.status(201).json({ issue });
});

router.patch('/:id/status', authorizeRoles('ADMIN', 'DEVELOPER'), validate(statusSchema), async (req, res) => {
  const issue = await prisma.issue.findFirst({ where: { id: req.params.id, deletedAt: null } });
  if (!issue) return res.status(404).json({ error: 'Issue not found.' });

  const { status } = req.body;
  if (!canMove(issue.status, status)) {
    return res.status(422).json({ error: `Cannot move issue from ${issue.status} to ${status}.` });
  }

  const updated = await prisma.issue.update({ where: { id: issue.id }, data: { status }, include });
  res.json({ issue: updated });
});

module.exports = router;