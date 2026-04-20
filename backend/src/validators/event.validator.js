const { z } = require("zod");

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  type: z.enum(["championship", "test", "gathering"]),
  description: z.string().optional(),
  price: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
  eventDate: z.string().datetime({ message: "Invalid date format. Use ISO 8601." }),
  location: z.string().optional(),
  mapUrl: z.string().optional(),
});

const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  type: z.enum(["championship", "test", "gathering"]).optional(),
  description: z.string().optional(),
  price: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
  eventDate: z.string().datetime().optional(),
  location: z.string().optional(),
  mapUrl: z.string().optional(),
});

const registerEventSchema = z.object({
  participantName: z.string().min(1, "Nama lengkap harus diisi"),
  gender: z.string().min(1, "Jenis kelamin harus diisi"),
  birthPlace: z.string().min(1, "Tempat lahir harus diisi"),
  birthDate: z.string().min(1, "Tanggal lahir tidak valid"),
  age: z.preprocess((val) => Number(val) || 0, z.number().int().min(1, "Usia minimal 1 tahun")),
  weight: z.preprocess((val) => Number(val) || 0, z.number().min(1, "Berat badan tidak valid")),
  levelCategory: z.string().min(1, "Kategori tingkat harus diisi"),
  competitionCategory: z.string().min(1, "Kategori lomba harus diisi"),
});

module.exports = { createEventSchema, updateEventSchema, registerEventSchema };
