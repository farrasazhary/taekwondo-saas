const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");
const { z } = require("zod");

const router = express.Router();

const upgradeSchema = z.object({
  type: z.enum(["reguler", "private"]),
});

const PRICES = {
  reguler: 200000,
  private: 500000,
};

// ============================================================
// POST /api/membership/upgrade — Candidate requests membership
// ============================================================
router.post("/upgrade", authenticate, async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const { type } = upgradeSchema.parse(req.body);

    if (role !== "candidate") {
      return res.status(400).json({ 
        success: false, 
        message: "Hanya untuk pendaftar dengan status kandidat." 
      });
    }

    const price = PRICES[type];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1); // 24 hours to pay

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        title: `Pendaftaran Member ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        amount: price,
        dueDate,
        status: "unpaid",
      },
    });

    res.status(201).json({
      success: true,
      message: "Invoice pendaftaran berhasil dibuat.",
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
