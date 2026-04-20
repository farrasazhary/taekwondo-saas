const { z } = require("zod");

const updateSettingsSchema = z.object({
  clubName: z.string().min(3).max(100).optional(),
  logoUrl: z.string().url("Invalid URL").optional().nullable(),
  midtransServerKey: z.string().optional().nullable(),
  midtransClientKey: z.string().optional().nullable(),
});

module.exports = { updateSettingsSchema };
