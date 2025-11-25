// src/helpers/emailjsOtp.js
import emailjs from "@emailjs/browser";

const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;

// ✅ ENV names as per requirement
const templateOtpId = import.meta.env.VITE_EMAILJS_TEMPLATE_OTP;
const templateWelcomeId = import.meta.env.VITE_EMAILJS_TEMPLATE_WELCOME;
const templateApprovedId = import.meta.env.VITE_EMAILJS_TEMPLATE_APPROVED;
const templateForgotId = import.meta.env.VITE_EMAILJS_TEMPLATE_FORGOT;

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

// 1️⃣ OTP Email (as-is, bas env name naya)
export const sendOtpEmail = async (toEmail, otp) => {
  checkBaseConfig();

  if (!templateOtpId) {
    throw new Error("VITE_EMAILJS_TEMPLATE_OTP is not set");
  }

  // Ye names tumhare template ke variables se match karne chahiye:
  // {{email}}  and  {{passcode}}
  const templateParams = {
    email: toEmail,
    passcode: otp,
    // time: new Date().toLocaleString(),
  };

  try {
    const res = await emailjs.send(
      serviceId,
      templateOtpId,
      templateParams,
      publicKey
    );

    console.log("EmailJS OTP sent:", res.status, res.text);
    return true;
  } catch (error) {
    console.error("EmailJS OTP error (details):", error);
    throw error;
  }
};

// 2️⃣ Welcome / Registration Successful Email
// template variables example: {{email}}, {{name}}, {{role}}
export const sendWelcomeEmail = async (email, name, role) => {
  checkBaseConfig();

  if (!templateWelcomeId) {
    throw new Error("VITE_EMAILJS_TEMPLATE_WELCOME is not set");
  }

  const templateParams = {
    email,
    name,
    role,
  };

  try {
    const res = await emailjs.send(
      serviceId,
      templateWelcomeId,
      templateParams,
      publicKey
    );
    console.log("Welcome email sent:", res.status, res.text);
    return true;
  } catch (error) {
    console.error("Welcome email error:", error);
    throw error;
  }
};

// 3️⃣ Doctor Account Approved Email
// template variables example: {{email}}, {{name}}
export const sendDoctorApprovedEmail = async (email, name) => {
  checkBaseConfig();

  if (!templateApprovedId) {
    throw new Error("VITE_EMAILJS_TEMPLATE_APPROVED is not set");
  }

  const templateParams = {
    email,
    name,
  };

  try {
    const res = await emailjs.send(
      serviceId,
      templateApprovedId,
      templateParams,
      publicKey
    );
    console.log("Doctor approved email sent:", res.status, res.text);
    return true;
  } catch (error) {
    console.error("Doctor approved email error:", error);
    throw error;
  }
};

// 4️⃣ Forgot Password Email (reset link)
// template variables example: {{email}}, {{reset_url}}
export const sendForgotPasswordEmail = async (email, reset_url) => {
  checkBaseConfig();

  if (!templateForgotId) {
    throw new Error("VITE_EMAILJS_TEMPLATE_FORGOT is not set");
  }

  const templateParams = {
    email,
    reset_url,
  };

  try {
    const res = await emailjs.send(
      serviceId,
      templateForgotId,
      templateParams,
      publicKey
    );
    console.log("Forgot password email sent:", res.status, res.text);
    return true;
  } catch (error) {
    console.error("Forgot password email error:", error);
    throw error;
  }
};
