// frontend/src/helpers/emailjsOtp.js

import emailjs from "@emailjs/browser";

// 👇 Tumhare EmailJS ke real credentials
const SERVICE_ID = "service_rigiks1";      // Email Services se
const TEMPLATE_ID = "template_qz1mjkl";    // OTP template ka ID
const PUBLIC_KEY = "hf_0d8Xbc4P1oVZIT";    // Account -> Public key

// Init (optional but safe)
emailjs.init({
  publicKey: PUBLIC_KEY,
});

/**
 * Send OTP email using EmailJS
 * @param {string} toEmail - jisko OTP bhejna hai
 * @param {string} otpCode - 6 digit OTP
 */
export async function sendOtpEmail(toEmail, otpCode) {
  const templateParams = {
    to_email: toEmail, // <- EmailJS template me {{to_email}}
    otp: otpCode,      // <- EmailJS template me {{otp}}
  };

  try {
    const res = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      { publicKey: PUBLIC_KEY } // v4 syntax
    );

    console.log("EmailJS OTP send response:", res.status, res.text);
    return res;
  } catch (error) {
    console.error("EmailJS OTP error (details):", error);
    throw error;
  }
}
