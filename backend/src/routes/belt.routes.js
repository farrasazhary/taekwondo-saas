const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// ============================================================
// GET /api/belts — List all belts (public master data)
// ============================================================
router.get("/", async (_req, res, next) => {
  try {
    const belts = await prisma.belt.findMany({
      orderBy: { levelOrder: "asc" },
    });

    res.json({ success: true, data: belts });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/belts/:id — Get belt by ID
// ============================================================
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid belt ID." });
    }

    const belt = await prisma.belt.findUnique({ where: { id } });

    if (!belt) {
      return res.status(404).json({ success: false, message: "Belt not found." });
    }

    res.json({ success: true, data: belt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
