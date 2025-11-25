// frontend/src/helpers/emailjsOtp.js

import emailjs from "@emailjs/browser";

export const sendOtpEmail = async (email, otpCode) => {
  try {
    const response = await emailjs.send(
      "service_rigiks1",       // <-- your Service ID
      "template_qz1mjkl",      // <-- your Template ID
      {
        to_email: email,       // matches variable name in template
        otp: otpCode,          // matches "otp" variable in template
      },
      "hf_0d8Xbc4P1oVZIT"      // <-- your Public Key
    );

    console.log("EmailJS Response:", response);
    return { success: true };
  } catch (error) {
    console.error("EmailJS Error:", error);
    return { success: false, error };
  }
};
