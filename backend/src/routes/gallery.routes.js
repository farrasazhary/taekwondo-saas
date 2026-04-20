const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth");
const upload = require("../middleware/multer");
const resizeImage = require("../middleware/resize");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// ============================================================
// GET /api/gallery/public — Get all gallery items (public)
// ============================================================
router.get("/public", async (_req, res, next) => {
  try {
    const items = await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/gallery — Get all gallery items (admin)
// ============================================================
router.get("/", authenticate, authorize("club_admin", "superadmin"), async (_req, res, next) => {
  try {
    const items = await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/gallery — Create a gallery item (admin)
// ============================================================
router.post(
  "/",
  authenticate,
  authorize("club_admin", "superadmin"),
  upload.single("galleryImage"),
  resizeImage,
  async (req, res, next) => {
    try {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, message: "Judul wajib diisi." });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Gambar wajib diunggah." });
      }

      const item = await prisma.gallery.create({
        data: {
          title,
          description: description || null,
          image: req.file.filename,
        },
      });

      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// DELETE /api/gallery/:id — Delete a gallery item (admin)
// ============================================================
router.delete(
  "/:id",
  authenticate,
  authorize("club_admin", "superadmin"),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await prisma.gallery.findUnique({ where: { id } });

      if (!item) {
        return res.status(404).json({ success: false, message: "Item galeri tidak ditemukan." });
      }

      // Delete image file
      const imagePath = path.join(__dirname, "../../public/uploads/gallery", item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      await prisma.gallery.delete({ where: { id } });

      res.json({ success: true, message: "Item galeri berhasil dihapus." });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
