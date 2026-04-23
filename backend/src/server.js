require("dotenv").config(); // Updated Schema Restart 2026-04-19 21:33

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const prisma = require("./lib/prisma");
const errorHandler = require("./middleware/errorHandler");

// ============================================================
// Initialize Express
// ============================================================
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Security Middlewares
// ============================================================

// Helmet — sets various HTTP headers for security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS — allow frontend origin with credentials (cookies)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiter — prevent brute-force / DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 10000, // higher limit for development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api/", limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 1000, // higher limit for development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
});
app.use("/api/auth/", authLimiter);

// Static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// ============================================================
// Body Parsers
// ============================================================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ============================================================
// Routes
// ============================================================

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Taekwondo SaaS API is running.",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
app.use("/api/auth",     require("./routes/auth.routes"));
app.use("/api/settings", require("./routes/settings.routes"));
app.use("/api/users",    require("./routes/user.routes"));
app.use("/api/invoices", require("./routes/invoice.routes"));
app.use("/api/events",   require("./routes/event.routes"));
app.use("/api/belts",    require("./routes/belt.routes"));
app.use("/api/webhook",  require("./routes/webhook.routes"));
app.use("/api/membership", require("./routes/membership.routes"));
app.use("/api/gallery",    require("./routes/gallery.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Global error handler (must be last)
app.use(errorHandler);



// ============================================================
// Start Server
// ============================================================
const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Only run the server locally. Vercel will process requests through the exported app directly.
if (!process.env.VERCEL) {
  startServer();
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("\n🛑 Server shut down gracefully.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;