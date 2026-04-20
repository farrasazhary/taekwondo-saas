const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({
      include: { belt: true }
    });
    console.log('TOTAL USERS:', users.length);
    console.log('ROLES:', [...new Set(users.map(u => u.role))]);
    console.log('USERS WITHOUT BELT:', users.filter(u => !u.currentBeltId).length);
    
    // Check if any user has a role NOT in our authorized list
    const unauthorized = users.filter(u => !['club_admin', 'superadmin', 'member_reguler', 'member_private'].includes(u.role));
    console.log('USERS WITH OTHER ROLES:', unauthorized.map(u => `${u.name} (${u.role})`));

  } catch (err) {
    console.error('DATABASE ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
