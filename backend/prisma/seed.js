require("dotenv").config();
const prisma = require("../src/lib/prisma");

/**
 * Seed the database with initial Belt master data and default Settings.
 */
async function main() {
  // ============================================================
  // Seed Settings (single-row club configuration)
  // ============================================================
  console.log("⚙️  Seeding settings...");
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      clubName: "My Taekwondo Club",
    },
  });
  console.log("✅ Settings ready.");

  // ============================================================
  // Seed Belts (master data)
  // ============================================================
  console.log("🥋 Seeding belts...");

  const belts = [
    { name: "White Belt (10th Gup)", color: "#FFFFFF", levelOrder: 1 },
    { name: "Yellow Belt (9th Gup)", color: "#FFD700", levelOrder: 2 },
    { name: "Yellow-Green Belt (8th Gup)", color: "#9ACD32", levelOrder: 3 },
    { name: "Green Belt (7th Gup)", color: "#228B22", levelOrder: 4 },
    { name: "Green-Blue Belt (6th Gup)", color: "#2E8B57", levelOrder: 5 },
    { name: "Blue Belt (5th Gup)", color: "#0000CD", levelOrder: 6 },
    { name: "Blue-Red Belt (4th Gup)", color: "#4169E1", levelOrder: 7 },
    { name: "Red Belt (3rd Gup)", color: "#DC143C", levelOrder: 8 },
    { name: "Red-Black Belt (2nd Gup)", color: "#8B0000", levelOrder: 9 },
    { name: "Black Belt Candidate (1st Gup)", color: "#1C1C1C", levelOrder: 10 },
    { name: "Black Belt (1st Dan)", color: "#000000", levelOrder: 11 },
    { name: "Black Belt (2nd Dan)", color: "#000000", levelOrder: 12 },
    { name: "Black Belt (3rd Dan)", color: "#000000", levelOrder: 13 },
  ];

  for (const belt of belts) {
    await prisma.belt.upsert({
      where: { id: belt.levelOrder },
      update: belt,
      create: belt,
    });
  }

  console.log(`✅ Seeded ${belts.length} belts.`);

  // ============================================================
  // Seed Users
  // ============================================================
  console.log("👤 Seeding users...");
  const bcrypt = require("bcryptjs");
  const passwordHash = await bcrypt.hash("password123", 12);

  // Super Admin
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Super Admin",
      passwordHash,
      role: "superadmin",
      phone: "081234567890",
    },
  });

  // Regular Member
  await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: {
      email: "member@example.com",
      name: "Regular Member",
      passwordHash,
      role: "member_reguler",
      phone: "081298765432",
      currentBeltId: 1, // White belt
    },
  });
  
  // Private Member
  await prisma.user.upsert({
    where: { email: "private@example.com" },
    update: {},
    create: {
      email: "private@example.com",
      name: "Private Member",
      passwordHash,
      role: "member_private",
      phone: "081211112222",
      currentBeltId: 2, // Yellow belt
    },
  });

  console.log("✅ Users ready (admin@example.com, member@example.com, private@example.com). Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
