const { z } = require("zod");

const createInvoiceSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  amount: z.number().positive("Amount must be a positive number"),
  dueDate: z.string().datetime({ message: "Invalid date format. Use ISO 8601." }),
});

const updateInvoiceSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["unpaid", "paid", "expired", "failed"]).optional(),
});

module.exports = { createInvoiceSchema, updateInvoiceSchema };
