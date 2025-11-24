// backend/utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // App password
  },
});

async function sendMail({ to, subject, text, html }) {
  try {
    const response = await transporter.sendMail({
      from: `"Prescripto" <${process.env.MAIL_USER}>`,
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
