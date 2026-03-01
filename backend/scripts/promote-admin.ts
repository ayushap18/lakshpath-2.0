/**
 * Admin Promotion Script
 *
 * Promotes an existing user to ADMIN role by email.
 *
 * Usage:
 *   npx ts-node --require tsconfig-paths/register scripts/promote-admin.ts <email>
 *
 * Or in production:
 *   DATABASE_URL="..." node -e "
 *     const { PrismaClient } = require('@prisma/client');
 *     const prisma = new PrismaClient();
 *     prisma.user.update({ where: { email: process.argv[1] }, data: { role: 'ADMIN' } })
 *       .then(u => { console.log('Promoted:', u.email); process.exit(0); })
 *       .catch(e => { console.error(e.message); process.exit(1); });
 *   " your-email@example.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npx ts-node --require tsconfig-paths/register scripts/promote-admin.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  if (user.role === 'ADMIN') {
    console.log(`${email} is already an ADMIN.`);
    process.exit(0);
  }

  await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log(`Successfully promoted ${email} to ADMIN.`);
  console.log(`They can now access /admin in the app.`);
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
