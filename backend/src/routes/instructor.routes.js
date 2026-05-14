const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth");
const { deleteFile } = require("../lib/fileHelper");
const upload = require("../middleware/multer");
const resizeImage = require("../middleware/resize");

const router = express.Router();

// ============================================================
// GET /api/instructors/public — Get all instructors (public)
// ============================================================
router.get("/public", async (_req, res, next) => {
  try {
    const instructors = await prisma.instructor.findMany({
      orderBy: { order: "asc" },
    });
    res.json({ success: true, data: instructors });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/instructors — Get all instructors (admin)
// ============================================================
router.get("/", authenticate, authorize("club_admin", "superadmin"), async (_req, res, next) => {
  try {
    const instructors = await prisma.instructor.findMany({
      orderBy: { order: "asc" },
    });
    res.json({ success: true, data: instructors });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/instructors — Create an instructor (admin)
// ============================================================
router.post(
  "/",
  authenticate,
  authorize("club_admin", "superadmin"),
  upload.single("instructorImage"),
  resizeImage,
  async (req, res, next) => {
    try {
      const { name, rank, order } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: "Nama wajib diisi." });
      }

      const instructor = await prisma.instructor.create({
        data: {
          name,
          rank: rank || "DAN I Kukkiwon",
          order: order ? parseInt(order, 10) : 0,
          image: req.file ? (req.file.path.startsWith("http") ? req.file.path : req.file.filename) : null,
        },
      });

      res.status(201).json({ success: true, data: instructor });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// DELETE /api/instructors/:id — Delete an instructor (admin)
// ============================================================
router.delete(
  "/:id",
  authenticate,
  authorize("club_admin", "superadmin"),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const instructor = await prisma.instructor.findUnique({ where: { id } });

      if (!instructor) {
        return res.status(404).json({ success: false, message: "Instruktur tidak ditemukan." });
      }

      // Delete image file
      if (instructor.image) {
        const fileIdentifier = instructor.image.startsWith("http") 
          ? instructor.image 
          : `/uploads/instructors/${instructor.image}`;
        await deleteFile(fileIdentifier);
      }

      await prisma.instructor.delete({ where: { id } });

      res.json({ success: true, message: "Instruktur berhasil dihapus." });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// PUT /api/instructors/:id — Update an instructor (admin)
// ============================================================
router.put(
  "/:id",
  authenticate,
  authorize("club_admin", "superadmin"),
  upload.single("instructorImage"),
  resizeImage,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, rank, order } = req.body;

      const oldInstructor = await prisma.instructor.findUnique({ where: { id } });
      if (!oldInstructor) {
        return res.status(404).json({ success: false, message: "Instruktur tidak ditemukan." });
      }

      const updateData = {
        name: name || oldInstructor.name,
        rank: rank || oldInstructor.rank,
        order: order ? parseInt(order, 10) : oldInstructor.order,
      };

      if (req.file) {
        // Delete old image
        if (oldInstructor.image) {
          const fileIdentifier = oldInstructor.image.startsWith("http") 
            ? oldInstructor.image 
            : `/uploads/instructors/${oldInstructor.image}`;
          await deleteFile(fileIdentifier);
        }
        updateData.image = req.file.path.startsWith("http") ? req.file.path : req.file.filename;
      }

      const updated = await prisma.instructor.update({
        where: { id },
        data: updateData,
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
