const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({ take: 5 });
    console.log('--- USERS ---');
    users.forEach(u => {
      console.log(`ID: ${u.id}, Name: ${u.name}, Status: ${u.status}, Belt: ${u.currentBeltId}`);
    });
  } catch (err) {
    console.error('Check Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
