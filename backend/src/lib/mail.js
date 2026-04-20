const nodemailer = require("nodemailer");

/**
 * Mail utility for sending emails via SMTP.
 * Fallbacks to console logging if SMTP credentials are not configured.
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "KINETIC Academy"}" <${process.env.SMTP_FROM_EMAIL || "no-reply@kinetic.com"}>`,
    to,
    subject,
    html,
  };

  try {
    // If no credentials are found, we log to console (useful for development)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("-----------------------------------------");
      console.log("SMTP Credentials missing. Logging Email:");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body (HTML): ${html}`);
      console.log("-----------------------------------------");
      return { success: true, messageId: "logged-to-console" };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
