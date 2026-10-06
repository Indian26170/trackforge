const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@trackforge.dev' },
    update: {},
    create: { email: 'admin@trackforge.dev', fullName: 'Admin User', role: 'ADMIN', passwordHash },
  });

  const dev = await prisma.user.upsert({
    where: { email: 'dev@trackforge.dev' },
    update: {},
    create: { email: 'dev@trackforge.dev', fullName: 'Dev User', role: 'DEVELOPER', passwordHash },
  });

  const project = await prisma.project.upsert({
    where: { key: 'TF' },
    update: {},
    create: { key: 'TF', name: 'TrackForge Platform', ownerId: admin.id, issueCounter: 5 },
  });

  const issues = [
    ['Login returns 500 on empty body', 'BUG', 'HIGH', 'TODO'],
    ['Add sprint backlog view', 'FEATURE', 'MEDIUM', 'TODO'],
    ['Upgrade base Docker image', 'CHORE', 'LOW', 'IN_PROGRESS'],
    ['Rate limit auth endpoints', 'FEATURE', 'HIGH', 'REVIEW'],
    ['Set up GitHub Actions pipeline', 'CHORE', 'MEDIUM', 'DONE'],
  ];

  for (const [i, [title, type, priority, status]] of issues.entries()) {
    const issueKey = `TF-${i + 1}`;
    await prisma.issue.upsert({
      where: { issueKey },
      update: {},
      create: {
        issueKey, title, type, priority, status,
        projectId: project.id,
        reporterId: admin.id,
        assigneeId: dev.id,
      },
    });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());