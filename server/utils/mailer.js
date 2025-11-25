// backend/utils/mailer.js

async function sendMail({ to, subject, text, html }) {
  try {
    console.log("Email sending skipped (SMTP/Nodemailer removed)");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML/Text:", html || text);

    // Dummy success response
    return {
      success: true,
      message: "Email sending disabled (no SMTP configured)",
    };
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

module.exports = { sendMail };
