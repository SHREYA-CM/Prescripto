// backend/utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
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

    console.log("Email Sent:", response.messageId);
    return response;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

module.exports = { sendMail };
