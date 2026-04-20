const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth");
const notificationEmitter = require("../lib/events");
const {
  createInvoiceSchema,
  updateInvoiceSchema,
} = require("../validators/invoice.validator");
const upload = require("../middleware/multer");
const resizeImage = require("../middleware/resize");

const router = express.Router();

// All invoice routes require authentication
router.use(authenticate);

// ============================================================
// GET /api/invoices — List invoices (admin: all, member: own)
// ============================================================
router.get("/", async (req, res, next) => {
  try {
    const { status, userId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const isAdmin = req.user.role === "club_admin" || req.user.role === "superadmin";

    const where = {
      // Members can only see their own invoices
      ...(!isAdmin && { userId: req.user.id }),
      ...(isAdmin && userId && { userId }),
      ...(status && { status }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        select: {
          id: true,
          title: true,
          amount: true,
          status: true,
          paymentMethod: true,
          paymentUrl: true,
          paymentProof: true,
          dueDate: true,
          paidAt: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      success: true,
      data: invoices,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/invoices — Create invoice (club_admin only)
// ============================================================
router.post("/", authorize("club_admin", "superadmin"), async (req, res, next) => {
  try {
    const data = createInvoiceSchema.parse(req.body);

    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId: data.userId,
        title: data.title,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
      },
      select: {
        id: true,
        title: true,
        amount: true,
        status: true,
        dueDate: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify user about new invoice
    notificationEmitter.emit("notification", {
      type: "INVOICE_CREATED",
      userId: invoice.userId,
      invoiceId: invoice.id,
      title: invoice.title
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/invoices/:id — Get invoice detail
// ============================================================
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === "club_admin" || req.user.role === "superadmin";

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        amount: true,
        status: true,
        paymentUrl: true,
        dueDate: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    // Members can only see their own invoices
    if (!isAdmin && invoice.user.id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Insufficient permissions." });
    }

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /api/invoices/:id — Update invoice (club_admin only)
// ============================================================
router.put("/:id", authorize("club_admin", "superadmin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateInvoiceSchema.parse(req.body);

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    const updateData = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.status === "paid") updateData.paidAt = new Date();

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        amount: true,
        status: true,
        paymentUrl: true,
        dueDate: true,
        paidAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: "Invoice updated successfully.",
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/invoices/:id — Delete invoice (club_admin only)
// ============================================================
router.delete("/:id", authorize("club_admin", "superadmin"), async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    if (existing.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a paid invoice.",
      });
    }

    await prisma.invoice.delete({ where: { id } });

    res.json({ success: true, message: "Invoice deleted successfully." });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/invoices/:id/upload-proof — User uploads payment proof
// ============================================================
router.post("/:id/upload-proof", upload.single("paymentProof"), resizeImage, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    if (existing.userId !== req.user.id && req.user.role !== "club_admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    if (existing.status === "paid") {
      return res.status(400).json({ success: false, message: "Invoice already paid." });
    }

    if (!req.file) {
      console.warn(`[UPLOAD ERROR] Payment proof file missing for invoice ${id}`);
      return res.status(400).json({ success: false, message: "Bukti transfer belum diunggah." });
    }

    await prisma.invoice.update({
      where: { id },
      data: {
        status: "pending_verification",
        paymentProof: req.file.filename,
        paymentMethod: "manual"
      },
    });

    // Notify admins about proof upload
    notificationEmitter.emit("notification", {
      type: "PENDING_VERIFICATION",
      userId: existing.userId, // This is for user, but admins listen to type
      invoiceId: id,
      title: existing.title
    });

    res.json({ success: true, message: "Bukti transfer berhasil diunggah. Menunggu konfirmasi admin." });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /api/invoices/:id/verify — Admin verifies payment
// ============================================================
router.put("/:id/verify", authorize("club_admin", "superadmin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; 

    const existing = await prisma.invoice.findUnique({
      where: { id },
      include: { eventRegistration: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Invoice not found." });
    }

    if (existing.status !== "pending_verification") {
      return res.status(400).json({ success: false, message: "Invoice is not pending verification." });
    }

    if (!approved) {
      // Rejecting the payment
      await prisma.invoice.update({
        where: { id },
        data: {
          status: "failed", // or back to unpaid
        },
      });
      return res.json({ success: true, message: "Payment rejected." });
    }

    // Approving
    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id },
        data: {
          status: "paid",
          paidAt: new Date(),
        },
      });

      if (existing.eventRegistration) {
        await tx.eventRegistration.update({
          where: { id: existing.eventRegistration.id },
          data: { status: "confirmed" },
        });
      }

      // Membership Upgrade Logic
      if (existing.title.startsWith("Pendaftaran Member")) {
        let newRole = "member_reguler";
        if (existing.title.toLowerCase().includes("private")) {
          newRole = "member_private";
        }
        
        await tx.user.update({
          where: { id: existing.userId },
          data: { 
            role: newRole,
            currentBeltId: 1 // Default: Sabuk Putih
          },
        });
      }
    });

    // Notify user about verification result
    notificationEmitter.emit("notification", {
      type: "INVOICE_VERIFIED",
      userId: existing.userId,
      invoiceId: id,
      title: existing.title,
      status: approved ? "paid" : "failed"
    });

    res.json({ success: true, message: "Payment approved successfully." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
