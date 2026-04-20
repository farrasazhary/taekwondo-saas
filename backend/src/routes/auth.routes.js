const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../lib/prisma");
const { sendEmail } = require("../lib/mail");
const { authenticate } = require("../middleware/auth");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const router = express.Router();

// ============================================================
// POST /api/auth/register — Register new candidate
// ============================================================
router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Removing the limit of 1 admin registration, allowing normal candidate registrations


    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: "candidate",
        phone: data.phone || null,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Welcome!",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/auth/login — Login with email + password
// ============================================================
router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/auth/logout — Clear the auth cookie
// ============================================================
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ success: true, message: "Logged out successfully." });
});

// ============================================================
// GET /api/auth/me — Get current authenticated user
// ============================================================
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
        currentBeltId: true,
        createdAt: true,
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
// POST /api/auth/forgot-password — Send reset email
// ============================================================
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security reasons, don't reveal if user exists. 
      // But in this specific SaaS context, we can be more helpful if the user prefers.
      return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Atur Ulang Kata Sandi - KINETIC Academy",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6;">Atur Ulang Kata Sandi</h2>
          <p>Halo ${user.name},</p>
          <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Atur Ulang Sekarang</a>
          </div>
          <p>Tautan ini akan kedaluwarsa dalam **1 jam**. Jika Anda tidak meminta pengaturan ulang ini, abaikan email ini.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Ini adalah email otomatis, mohon tidak membalas.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Instruksi pengaturan ulang kata sandi telah dikirim ke email Anda." });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/auth/reset-password — Update password via token
// ============================================================
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password are required." });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Token tidak valid atau sudah kedaluwarsa." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ success: true, message: "Kata sandi berhasil diperbarui. Silakan login kembali." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
