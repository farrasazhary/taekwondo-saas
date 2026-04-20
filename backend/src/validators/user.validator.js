const { z } = require("zod");

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  role: z.enum(["member_reguler", "member_private", "candidate", "club_admin"]).default("candidate"),
  phone: z.string().min(1, "Nomor HP wajib diisi"),
  gender: z.string().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  currentBeltId: z.number().int().positive().optional().nullable(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["member_reguler", "member_private", "candidate", "club_admin"]).optional(),
  phone: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  currentBeltId: z.number().int().positive().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});

module.exports = { createUserSchema, updateUserSchema, changePasswordSchema };
