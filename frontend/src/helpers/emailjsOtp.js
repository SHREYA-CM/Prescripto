// src/helpers/emailjsOtp.js
import emailjs from "@emailjs/browser";

const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;

// 🔐 Template IDs from .env
// OTP template (One-Time Password)
const templateOtpId = import.meta.env.VITE_EMAILJS_TEMPLATE_OTP;

// Multi-purpose template ID (Welcome / Approved / Forgot sab isi se)
// FREE plan me: in tino envs me SAME ID rakh sakti ho
const templateWelcomeId = import.meta.env.VITE_EMAILJS_TEMPLATE_WELCOME;
const templateApprovedId =
  import.meta.env.VITE_EMAILJS_TEMPLATE_APPROVED || templateWelcomeId;
const templateForgotId =
  import.meta.env.VITE_EMAILJS_TEMPLATE_FORGOT || templateWelcomeId;

// (optional) init – safe call
if (publicKey) {
  emailjs.init(publicKey);
} else {
  console.warn(
    "EmailJS public key missing – check VITE_EMAILJS_PUBLIC_KEY in .env"
  );
}

const checkBaseConfig = () => {
  if (!serviceId || !publicKey) {
    console.error("EmailJS ENV missing", {
      serviceId,
      publicKey,
    });
    throw new Error("EmailJS configuration missing");
  }
};

// 1️⃣ OTP Email
export const sendOtpEmail = async (toEmail, otp) => {
  checkBaseConfig();

  if (!templateOtpId) {
    throw new Error("VITE_EMAILJS_TEMPLATE_OTP is not set");
  }

  const templateParams = {
    email: toEmail,
    passcode: otp,
  };

  console.log("EmailJS OTP → service:", serviceId, "template:", templateOtpId);

  const res = await emailjs.send(
    serviceId,
    templateOtpId,
    templateParams,
    publicKey
  );

  console.log("EmailJS OTP sent:", res.status, res.text);
  return true;
};

// 2️⃣ Welcome Email (multi-purpose template)
export const sendWelcomeEmail = async (email, name, role) => {
  checkBaseConfig();

  if (!templateWelcomeId) {
    throw new Error("VITE_EMAILJS_TEMPLATE_WELCOME is not set");
  }

  const templateParams = {
    email,
    name,
    role,
    isWelcome: true,
    isApproved: false,
    isForgot: false,
  };

  console.log(
    "EmailJS Welcome → service:",
    serviceId,
    "template:",
    templateWelcomeId
  );

  const res = await emailjs.send(
    serviceId,
    templateWelcomeId,
    templateParams,
    publicKey
  );
  console.log("Welcome email sent:", res.status, res.text);
  return true;
};

// 3️⃣ Doctor Account Approved Email
export const sendDoctorApprovedEmail = async (email, name) => {
  checkBaseConfig();

  if (!templateApprovedId) {
    throw new Error("VITE_EMAILJS_TEMPLATE_APPROVED is not set");
  }

  const templateParams = {
    email,
    name,
    isWelcome: false,
    isApproved: true,
    isForgot: false,
  };

  console.log(
    "EmailJS Approved → service:",
    serviceId,
    "template:",
    templateApprovedId
  );

  const res = await emailjs.send(
    serviceId,
    templateApprovedId,
    templateParams,
    publicKey
  );
  console.log("Doctor approved email sent:", res.status, res.text);
  return true;
};

// 4️⃣ Forgot Password Email
export const sendForgotPasswordEmail = async (email, reset_url) => {
  checkBaseConfig();

  if (!templateForgotId) {
    throw new Error("VITE_EMAILJS_TEMPLATE_FORGOT is not set");
  }

  const templateParams = {
    email,
    reset_url,
    isWelcome: false,
    isApproved: false,
    isForgot: true,
  };

  console.log(
    "EmailJS Forgot → service:",
    serviceId,
    "template:",
    `"${templateForgotId}"`
  );

  const res = await emailjs.send(
    serviceId,
    templateForgotId,
    templateParams,
    publicKey
  );
  console.log("Forgot password email sent:", res.status, res.text);
  return true;
};
