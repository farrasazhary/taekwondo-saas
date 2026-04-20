const express = require("express");
const prisma = require("../lib/prisma");
const upload = require("../middleware/multer");
const resizeImage = require("../middleware/resize");
const { authenticate, authorize } = require("../middleware/auth");
const { createEventSchema, updateEventSchema, registerEventSchema } = require("../validators/event.validator");

const router = express.Router();

// ============================================================
// GET /api/events/public — Public upcoming events
// ============================================================
router.get("/public", async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { eventDate: { gte: new Date() } },
      orderBy: { eventDate: "asc" },
      take: 3, // Show latest 3 upcoming events
    });
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/events/public/:id — Public Event detail
// ============================================================
router.get("/public/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
});

// All event routes below require authentication
router.use(authenticate);

// ============================================================
// GET /api/events — List events
// ============================================================
router.get("/", async (req, res, next) => {
  try {
    const { type, upcoming, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(type && { type }),
      ...(upcoming === "true" && { eventDate: { gte: new Date() } }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { eventDate: "asc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      success: true,
      data: events,
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
// POST /api/events — Create event (club_admin only)
// ============================================================
router.post("/", authorize("club_admin", "superadmin"), upload.single("image"), resizeImage, async (req, res, next) => {
  try {
    const data = createEventSchema.parse(req.body);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        type: data.type,
        description: data.description || null,
        location: data.location || null,
        mapUrl: data.mapUrl || null,
        price: data.price || null,
        image: req.file ? req.file.filename : null,
        eventDate: new Date(data.eventDate),
      },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: event,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/events/:id — Get event detail
// ============================================================
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /api/events/:id — Update event (club_admin only)
// ============================================================
router.put("/:id", authorize("club_admin", "superadmin"), upload.single("image"), resizeImage, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateEventSchema.parse(req.body);

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const updateData = {
      ...data,
      ...(data.eventDate && { eventDate: new Date(data.eventDate) }),
      ...(req.file && { image: req.file.filename }),
    };

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Event updated successfully.",
      data: event,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/events/:id — Delete event (club_admin only)
// ============================================================
router.delete("/:id", authorize("club_admin", "superadmin"), async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    await prisma.event.delete({ where: { id } });

    res.json({ success: true, message: "Event deleted successfully." });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/events/registrations/me - Get current user registrations
// ============================================================
router.get("/registrations/me", async (req, res, next) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: req.user.id },
      include: {
        invoice: { select: { status: true } },
      },
    });
    res.json({ success: true, data: registrations });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/events/:id/register - Register for an event with participant data
// ============================================================
router.post("/:id/register", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate participant details from request body
    const data = registerEventSchema.parse(req.body);

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    const existing = await prisma.eventRegistration.findFirst({
      where: { userId, eventId: id },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Already registered." });
    }

    const price = event.price ? Number(event.price) : 0;
    
    // Create registration and invoice in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let createdInvoice = null;
      let status = "pending";

      if (price > 0) {
        createdInvoice = await tx.invoice.create({
          data: {
            userId,
            title: `Pendaftaran Event: ${event.title}`,
            amount: price,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            status: "unpaid",
          },
        });
      } else {
        status = "confirmed";
      }

      const reg = await tx.eventRegistration.create({
        data: {
          userId,
          eventId: id,
          participantName: data.participantName,
          gender: data.gender,
          birthPlace: data.birthPlace,
          birthDate: new Date(data.birthDate),
          age: data.age,
          weight: data.weight,
          levelCategory: data.levelCategory,
          competitionCategory: data.competitionCategory,
          invoiceId: createdInvoice ? createdInvoice.id : null,
          status,
        },
      });

      return { registration: reg, invoice: createdInvoice };
    });

    res.status(201).json({ success: true, message: "Registration successful.", data: result });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/events/:id/participants - List event participants (Admin Only)
// ============================================================
router.get("/:id/participants", authorize("club_admin", "superadmin"), async (req, res, next) => {
  try {
    const { id } = req.params;

    const participants = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        invoice: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: participants });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
