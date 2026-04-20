/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a standardized JSON response.
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Prisma known errors
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists.",
      field: err.meta?.target,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found.",
    });
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    console.warn(`[VALIDATION ERROR] ${JSON.stringify(err.errors)}`);
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Multer errors
  if (err.name === "MulterError") {
    let message = "FileUpload Error";
    if (err.code === "LIMIT_FILE_SIZE") message = "File too large. Max 5MB allowed.";
    return res.status(400).json({ success: false, message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error.",
  });
};

module.exports = errorHandler;
