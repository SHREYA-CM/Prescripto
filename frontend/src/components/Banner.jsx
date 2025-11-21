import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate("/login"); // 👈 ab login page pe redirect karega
  };

  return (
    <section className="flex justify-center py-12">
      <div className="bg-blue-600 text-white rounded-xl shadow-lg w-full max-w-6xl px-6 py-12 grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Section */}
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Book Your Appointment
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Connect with 100+ trusted doctors and get expert consultation at
            your convenience.
          </p>
          <button
            onClick={handleCreateAccount}
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow hover:bg-gray-100 transition"
          >
            Create Account
          </button>
        </div>

        {/* Right Section */}
        <div className="flex justify-center md:justify-end">
          <img
            src={assets.appointment_img}
            alt="Book an appointment"
            loading="lazy"
            className="w-full max-w-sm md:max-w-md object-contain rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;
