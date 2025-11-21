import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div className="py-12 px-4 sm:px-8 lg:px-16">
      {/* Heading */}
      <div className="text-center mb-12 pt-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wide">
          ABOUT <span className="text-blue-600">US</span>
        </h2>
        {/* Decorative underline */}
        <div className="w-20 h-1 bg-blue-600 mx-auto mt-3 rounded"></div>
        <p className="text-gray-500 mt-4 text-base max-w-2xl mx-auto">
          Learn more about who we are and what we do
        </p>
      </div>

      {/* Content Section */}
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Left Image */}
        <div className="flex-1">
          <img
            src={assets.about_image}
            alt="About Prescripto"
            className="rounded-xl shadow-md w-full object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 space-y-6 text-gray-600">
          <p>
            Welcome to{" "}
            <span className="font-semibold text-gray-800">Prescripto</span>,
            your trusted partner in managing healthcare needs conveniently and
            efficiently. At Prescripto, we understand the challenges individuals
            face when it comes to scheduling doctor appointments and managing
            their health records.
          </p>

          <p>
            Our commitment is to excellence in healthcare technology. We
            continuously enhance our platform by integrating the latest
            advancements to improve user experience and deliver superior
            service. Whether you're booking your first appointment or managing
            ongoing care, Prescripto is here to support you every step of the
            way.
          </p>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Our Vision
            </h3>
            <p>
              Our vision at Prescripto is to create a seamless healthcare
              experience for every user. We aim to bridge the gap between
              patients and healthcare providers, making it easier for you to
              access the care you need, when you need it.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">
          WHY CHOOSE <span className="text-blue-600">US</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg text-gray-800 mb-2">
              Efficiency
            </h4>
            <p className="text-gray-600 text-sm">
              Streamlined appointment scheduling that fits into your busy
              lifestyle.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg text-gray-800 mb-2">
              Convenience
            </h4>
            <p className="text-gray-600 text-sm">
              Access to a network of trusted healthcare professionals in your
              area.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg text-gray-800 mb-2">
              Personalization
            </h4>
            <p className="text-gray-600 text-sm">
              Tailored recommendations and reminders to help you stay on top of
              your health.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
