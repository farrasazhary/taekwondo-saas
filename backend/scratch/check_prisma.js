const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.user.findFirst();
    console.log('User found:', !!user);
    if (user) {
      console.log('User fields:', Object.keys(user));
    }
  } catch (err) {
    console.error('Prisma Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
