// backend/utils/mailer.js
const { Resend } = require("resend");

// Your API Key
const resend = new Resend("rnd_ChrjTEvfSoLAbnZEvld9fBMoHPmr");

async function sendMail({ to, subject, text, html }) {
  try {
    const response = await resend.emails.send({
      from: "Prescripto <noreply@resend.dev>",
      to,
      subject,
      html: html || `<p>${text}</p>`,
    });

    console.log("Email Sent:", response);
    return response;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

module.exports = { sendMail };
