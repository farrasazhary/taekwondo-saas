const { PrismaClient } = require("@prisma/client");

// Singleton pattern to prevent multiple Prisma Client instances in dev
const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

const prisma = globalForPrisma.prisma;

module.exports = prisma;
