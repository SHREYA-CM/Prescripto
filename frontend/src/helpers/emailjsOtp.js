import emailjs from "@emailjs/browser";

export const sendOtpEmail = async (toEmail, otp) => {
  const templateParams = {
    to_email: toEmail, // EmailJS template variable
    otp: otp,          // EmailJS template variable
  };

  return emailjs.send(
    "service_rigiks1",     // tumhara Service ID
    "template_qz1mjkl",    // tumhara Template ID
    templateParams,
    "hf_0d8Xbc4P1oVZIT"    // tumhara Public key
  );
};
