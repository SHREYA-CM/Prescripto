// server/utils/mailer.js
// FINAL DUMMY MAILER — SAFE, NO SMTP, NO RESEND, NO ERRORS

async function sendMail({ to, subject, text, html }) {
  try {
    console.log("----------------------------------------------------");
    console.log("📧 Email sending skipped (Backend email disabled)");
    console.log("➡️  To:", to);
    console.log("➡️  Subject:", subject);
    console.log("➡️  Content:", html || text || "(no content provided)");
    console.log("----------------------------------------------------");

    // Return a dummy success (backend won't send real email)
    return {
      success: true,
      message: "Email sending disabled on backend (using dummy mailer)",
    };
  } catch (error) {
    console.error("❌ Dummy mailer error:", error);
    throw error; // not required, but keeps logs clean
  }
}

module.exports = { sendMail };
