const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const upload = require("../middleware/multer");
const resizeImage = require("../middleware/resize");
const { authenticate, authorize } = require("../middleware/auth");
const {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
} = require("../validators/user.validator");

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// ============================================================
// GET /api/users/stats — Get dashboard stats (admin only)
// ============================================================
router.get("/stats", authorize("club_admin", "superadmin", "member_reguler", "member_private"), async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [total, privateCount, regularCount, newRegistrations] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "member_private" } }),
      prisma.user.count({ where: { role: "member_reguler" } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        privateCount,
        regularCount,
        newRegistrations,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/users — List all users (club_admin only)
// ============================================================
router.get("/", authorize("club_admin", "superadmin", "member_reguler", "member_private"), async (req, res, next) => {
  try {
    const { role, search, currentBeltId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { role }),
      ...(currentBeltId && { currentBeltId: parseInt(currentBeltId) }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          gender: true,
          birthPlace: true,
          birthDate: true,
          profileImage: true,
          status: true,
          createdAt: true,
          belt: { select: { id: true, name: true, color: true, levelOrder: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
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
// POST /api/users — Create a new user/member (club_admin only)
// ============================================================
router.post("/", authorize("club_admin", "superadmin"), async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        phone: data.phone || null,
        gender: data.gender || null,
        birthPlace: data.birthPlace || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        currentBeltId: data.currentBeltId || null,
        status: data.status || "active",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        gender: true,
        birthPlace: true,
        birthDate: true,
        profileImage: true,
        status: true,
        createdAt: true,
        belt: { select: { id: true, name: true, color: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/users/:id — Get user detail (admin or self)
// ============================================================
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Members can only view their own profile
    if (req.user.role !== "club_admin" && req.user.role !== "superadmin" && req.user.id !== id) {
      return res.status(403).json({ success: false, message: "Insufficient permissions." });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        gender: true,
        birthPlace: true,
        birthDate: true,
        profileImage: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        belt: { select: { id: true, name: true, color: true, levelOrder: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /api/users/:id — Update user (admin or self for limited fields)
// ============================================================
router.put("/:id", upload.single("profileImage"), resizeImage, async (req, res, next) => {
  console.log("UPDATE USER DEBUG - Body:", req.body);
  console.log("UPDATE USER DEBUG - File:", req.file);
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === "club_admin" || req.user.role === "superadmin";
    const isSelf = req.user.id === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ success: false, message: "Insufficient permissions." });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const data = updateUserSchema.parse(req.body);

    // Prepare update data
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.birthPlace !== undefined) updateData.birthPlace = data.birthPlace;

    // Admin-only fields
    if (isAdmin) {
      if (data.role !== undefined) updateData.role = data.role;
      if (data.status !== undefined) updateData.status = data.status;
      
      // Use relational connect/disconnect for belt updates to be more robust
      if (data.currentBeltId !== undefined) {
        if (data.currentBeltId !== null) {
          updateData.belt = { connect: { id: parseInt(data.currentBeltId) } };
        } else {
          updateData.belt = { disconnect: true };
        }
      }
    }

    // Handle birthDate specifically
    if (data.birthDate) {
      const d = new Date(data.birthDate);
      if (!isNaN(d.getTime())) {
        updateData.birthDate = d;
      }
    } else if (data.birthDate === "" || data.birthDate === null) {
      updateData.birthDate = null;
    }

    // Handle profile image
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    console.log("UPDATE USER DEBUG - Final updateData:", updateData);
    console.log("PRISMA MODEL DEBUG - User fields:", Object.keys(prisma.user));

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        gender: true,
        birthPlace: true,
        birthDate: true,
        profileImage: true,
        status: true,
        updatedAt: true,
        belt: { select: { id: true, name: true, color: true } },
      },
    });

    res.json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /api/users/:id/password — Change password (self only)
// ============================================================
router.put("/:id/password", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "You can only change your own password.",
      });
    }

    const data = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/users/:id — Delete user (club_admin only)
// ============================================================
router.delete("/:id", authorize("club_admin", "superadmin"), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
