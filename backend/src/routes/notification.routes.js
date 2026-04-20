const express = require("express");
const { authenticate } = require("../middleware/auth");
const notificationEmitter = require("../lib/events");

const router = express.Router();

// SSE Endpoint for real-time notifications
router.get("/stream", authenticate, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  
  // CORS check is handled by global cors middleware
  // but we ensure the client stays connected
  res.flushHeaders();

  const userId = req.user.id;
  const isAdmin = req.user.role === "club_admin" || req.user.role === "superadmin";

  const onUpdate = (eventData) => {
    // Send update if:
    // 1. It's for the specific user
    // 2. It's for an admin and it's a pending_verification update
    const shouldNotify = 
      eventData.userId === userId || 
      (isAdmin && eventData.type === "PENDING_VERIFICATION");

    if (shouldNotify) {
      res.write(`data: ${JSON.stringify({ type: "update", ...eventData })}\n\n`);
    }
  };

  notificationEmitter.on("notification", onUpdate);

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(heartbeat);
    notificationEmitter.removeListener("notification", onUpdate);
  });
});

module.exports = router;
