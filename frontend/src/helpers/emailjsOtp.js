// src/helpers/emailjsOtp.js
import emailjs from "@emailjs/browser";

const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

// (optional) init – safe call
if (publicKey) {
  emailjs.init(publicKey);
} else {
  console.warn(
    "EmailJS public key missing – check VITE_EMAILJS_PUBLIC_KEY in .env"
  );
}

export const sendOtpEmail = async (toEmail, otp) => {
  // Ye names tumhare template ke variables se match karne chahiye:
  // {{email}}  and  {{passcode}}
  const templateParams = {
    email: toEmail,
    passcode: otp,
    // time: new Date().toLocaleString(), // agar template me {{time}} use karna ho
  };

  try {
    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS ENV missing", {
        serviceId,
        templateId,
        publicKey,
      });
      throw new Error("EmailJS configuration missing");
    }

    const res = await emailjs.send(
      serviceId,
      templateId,
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
