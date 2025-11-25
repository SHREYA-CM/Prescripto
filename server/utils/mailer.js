// server/utils/mailer.js
// FINAL DUMMY MAILER – backend se actual email nahi jayega
// sirf console me log ayega, taaki Resend/nodemailer/EmailJS ke errors band ho jayein.

async function sendMail({ to, subject, text, html }) {
  try {
    console.log("----------------------------------------------------");
    console.log("📧 Backend email sending is DISABLED (dummy mailer)");
    console.log("➡️ To:", to);
    console.log("➡️ Subject:", subject);
    console.log("➡️ Content:", html || text || "(no content provided)");
    console.log("----------------------------------------------------");

    return {
      success: true,
      message: "Email sending disabled on backend (dummy mailer in use)",
    };
  } catch (error) {
    console.error("❌ Dummy mailer error:", error);
    throw error;
  }
}

module.exports = { sendMail };
