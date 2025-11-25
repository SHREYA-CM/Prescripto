// backend/utils/mailer.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail({ to, subject, text, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Prescripto <onboarding@resend.dev>",
      to,
      subject,
      html: html || `<p>${text}</p>`,
    });

    if (error) {
      console.error("Resend Email Error:", error);
      throw error;
    }

    console.log("OTP Email Sent:", data?.id);
    return data;
  } catch (error) {
    console.error("Resend sendMail exception:", error);
    throw error;
  }
}

module.exports = { sendMail };
