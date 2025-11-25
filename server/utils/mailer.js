// backend/utils/mailer.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail({ to, subject, text, html }) {
  try {
    const response = await resend.emails.send({
      from: "Prescripto <onboarding@resend.dev>",   // or your custom domain
      to,
      subject,
      html: html || `<p>${text}</p>`,
    });

    console.log("OTP Email Sent:", response.id);
    return response;
  } catch (error) {
    console.error("Resend Email Error:", error);
    throw error;
  }
}

module.exports = { sendMail };
