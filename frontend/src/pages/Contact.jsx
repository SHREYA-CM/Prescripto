import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 md:px-16 lg:px-24 py-16 bg-gray-50">
      {/* Heading */}
      <div className="text-center mb-14 pt-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wide">
          CONTACT <span className="text-blue-600">US</span>
        </h2>
        <div className="w-20 h-1 bg-blue-600 mx-auto mt-3 rounded"></div>
        <p className="text-gray-500 mt-4 text-base max-w-2xl mx-auto">
          We’d love to hear from you. Reach out anytime!
        </p>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Image */}
        <div className="flex justify-center">
          <img
            src={assets.contact_image}
            alt="Contact"
            className="rounded-2xl shadow-md w-full max-w-md object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="space-y-8">
          {/* Office Info */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-gray-800">Our Office</h3>
            <p className="mt-2 text-gray-600">
              54709 Willms Station <br />
              Suite 350, Washington, USA
            </p>
          </div>

          {/* Contact Info */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-gray-800">
              Contact Info
            </h3>
            <p className="mt-2 text-gray-600">
              Tel: <span className="font-medium text-gray-900">(415) 555-0132</span>
              <br />
              Email: <span className="font-medium text-gray-900">shrey@gmail.com</span>
            </p>
          </div>

          {/* Careers Section */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-gray-800">
              Careers at PRESCRIPTO
            </h3>
            <p className="mt-2 text-gray-600">
              Learn more about our teams and job openings.
            </p>
            <button
              onClick={() => navigate("/careers")}
              className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
            >
              Explore Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
