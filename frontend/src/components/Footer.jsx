import React, { useState } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

// Assuming you have an assets object like this
const assets = {
  logo: 'https://placehold.co/150x50/FFFFFF/000000?text=Prescripto',
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email.");
      return;
    }

    // Future: Send this email to your backend API
    console.log("Subscribed email:", email);

    setMessage("Thank you for subscribing! 🎉");
    setEmail(""); // clear input
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 py-14">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Left Section */}
        <div>
          <img src={assets.logo} alt="Prescripto Logo" className="h-12 mb-4" />
          <p className="text-sm leading-relaxed">
            Prescripto is your trusted healthcare partner — book doctor
            appointments, manage prescriptions, and get expert consultation
            anytime, anywhere.
          </p>
        </div>

        {/* Company Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
          <ul className="space-y-2">
            <li className="hover:text-blue-400 cursor-pointer">Home</li>
            <li className="hover:text-blue-400 cursor-pointer">About Us</li>
            <li className="hover:text-blue-400 cursor-pointer">Contact Us</li>
            <li className="hover:text-blue-400 cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* Get in Touch */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
          <ul className="space-y-2">
            <li>📞 +91-123-456-7890</li>
            <li>📧 support@prescripto.com</li>
          </ul>
          <div className="flex space-x-4 mt-4">
            {[FaFacebookF, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="p-2 bg-gray-700 rounded-full hover:bg-blue-600 transition transform hover:scale-110"
              >
                <Icon className="text-white w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
          <p className="text-sm mb-3">
            Subscribe to get the latest healthcare tips & updates.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 w-full rounded-l-lg text-gray-800 focus:outline-none"
            />
            <button
              onClick={handleSubscribe}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
          </div>
          {message && (
            <p className={`mt-2 text-sm ${message.includes('Thank') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-700 pt-6">
        <p>© {new Date().getFullYear()} Prescripto. All rights reserved.</p>
        <p className="mt-1">Crafted with care in Churk, Uttar Pradesh.</p>
      </div>
    </footer>
  );
};

export default Footer;
