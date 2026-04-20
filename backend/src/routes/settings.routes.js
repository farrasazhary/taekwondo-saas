const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth");
const { updateSettingsSchema } = require("../validators/settings.validator");

const router = express.Router();

// ============================================================
// GET /api/settings — Get club settings (Public)
// ============================================================
router.get("/", async (_req, res, next) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return res.status(404).json({ success: false, message: "Settings not found." });
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /api/settings — Update club settings (admin only)
// ============================================================
router.put("/", authenticate, authorize("club_admin", "superadmin"), async (req, res, next) => {
  try {
    const data = updateSettingsSchema.parse(req.body);

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        clubName: data.clubName || "My Taekwondo Club",
        ...data,
      },
    });

    res.json({
      success: true,
      message: "Settings updated successfully.",
      data: settings,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
