import React from "react";

const Careers = () => {
  return (
    <div className="p-6 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Careers at <span className="text-blue-600">Prescripto</span>
        </h1>
        <p className="text-gray-600 mb-10">
          Join our mission to transform healthcare! Explore exciting opportunities
          to work with talented professionals and make a difference.
        </p>

        {/* Jobs Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Job Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-gray-800">Frontend Developer</h2>
            <p className="text-gray-600 mt-2">
              Build beautiful and responsive interfaces with React & Tailwind CSS.
            </p>
            <button className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">
              Apply Now
            </button>
          </div>

          {/* Job Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-gray-800">Backend Developer</h2>
            <p className="text-gray-600 mt-2">
              Work with Node.js & MongoDB to power healthcare applications.
            </p>
            <button className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">
              Apply Now
            </button>
          </div>

          {/* Job Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-gray-800">UI/UX Designer</h2>
            <p className="text-gray-600 mt-2">
              Create user-friendly experiences that delight patients and doctors.
            </p>
            <button className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">
              Apply Now
            </button>
          </div>

          {/* Job Card 4 */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-gray-800">Data Analyst</h2>
            <p className="text-gray-600 mt-2">
              Analyze healthcare data to drive better decisions and insights.
            </p>
            <button className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">
              Apply Now
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-500 mt-10 text-sm">
          Don’t see the role you’re looking for?{" "}
          <span className="text-blue-600 font-medium">Send us your CV!</span>
        </p>
      </div>
    </div>
  );
};

export default Careers;
