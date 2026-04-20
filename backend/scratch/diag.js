require('dotenv').config();
const prisma = require('../src/lib/prisma');

async function checkMe() {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        gender: true,
        birthPlace: true,
        birthDate: true,
        profileImage: true,
        currentBeltId: true,
        createdAt: true,
        belt: { select: { id: true, name: true, color: true, levelOrder: true } },
      },
    });
    console.log("SUCCESS:", JSON.stringify(user, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkMe();
