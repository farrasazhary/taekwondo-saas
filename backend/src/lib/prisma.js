const { PrismaClient } = require("@prisma/client");

// Singleton pattern to prevent multiple Prisma Client instances in dev
const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  console.log("DEBUG: Initializing Prisma Client v1.0.1 (Classic Mode)");
  globalForPrisma.prisma = new PrismaClient({
    log: ["error"],
  });
}

const prisma = globalForPrisma.prisma;

module.exports = prisma;
