const express = require("express");
const crypto = require("crypto");
const prisma = require("../lib/prisma");

const router = express.Router();

// ============================================================
// POST /api/webhook/midtrans — Midtrans Payment Notification
// This endpoint is called by Midtrans when a payment status changes.
// It MUST verify the SHA512 signature before updating any data.
// ============================================================
router.post("/midtrans", async (req, res, next) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = req.body;

    // Validate required fields
    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return res.status(400).json({ success: false, message: "Invalid notification payload." });
    }

    // Find the invoice (order_id === invoice.id)
    const invoice = await prisma.invoice.findUnique({
      where: { id: order_id },
    });

    if (!invoice) {
      return res.status(200).json({ success: false, message: "Invoice not found." });
    }

    // Get the club's Midtrans server key from Settings
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    const serverKey = settings?.midtransServerKey;

    if (!serverKey) {
      console.error("[WEBHOOK] Midtrans server key not configured in Settings.");
      return res.status(200).json({ success: false, message: "Payment gateway not configured." });
    }

    // ============================================================
    // VERIFY SHA512 SIGNATURE
    // Formula: SHA512(order_id + status_code + gross_amount + server_key)
    // ============================================================
    const expectedSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.error(`[WEBHOOK] Invalid signature for order ${order_id}.`);
      return res.status(403).json({ success: false, message: "Invalid signature." });
    }

    // ============================================================
    // MAP MIDTRANS STATUS → INVOICE STATUS
    // ============================================================
    let newStatus;

    if (transaction_status === "capture") {
      newStatus = fraud_status === "accept" ? "paid" : "failed";
    } else if (transaction_status === "settlement") {
      newStatus = "paid";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny"
    ) {
      newStatus = "failed";
    } else if (transaction_status === "expire") {
      newStatus = "expired";
    } else if (transaction_status === "pending") {
      newStatus = "unpaid";
    } else {
      console.warn(`[WEBHOOK] Unknown transaction_status: ${transaction_status} for order ${order_id}`);
      return res.status(200).json({ success: true, message: "Notification received." });
    }

    // Update the invoice
    await prisma.invoice.update({
      where: { id: order_id },
      data: {
        status: newStatus,
        ...(newStatus === "paid" && { paidAt: new Date() }),
      },
    });

    console.log(`[WEBHOOK] Invoice ${order_id} updated to ${newStatus}.`);

    res.status(200).json({ success: true, message: "Notification processed." });
  } catch (err) {
    console.error("[WEBHOOK] Error processing notification:", err.message);
    res.status(200).json({ success: false, message: "Internal error." });
  }
});

module.exports = router;
