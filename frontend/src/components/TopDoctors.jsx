import React from 'react';
import { doctors } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const TopDoctor = () => {
  const navigate = useNavigate();

  return (
    <div className="my-16 px-4 md:px-10 text-gray-900">
      {/* Heading */}
      <div className="text-center mb-8">
        {/* changed text here */}
        <h1 className="text-3xl font-bold mb-2">Top Doctors</h1>
        <p className="text-gray-600">
          Simply browse through our extensive list of trusted doctors.
        </p>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {doctors.slice(0, 10).map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(`appointment/${item._id}`)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col items-center text-center cursor-pointer"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 rounded-full object-cover mb-3"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <p>Available</p>
              </div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button onClick ={()=>{navigate('/doctors');scrollTo(0,0)}}className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
          More
        </button>
      </div>
    </div>
  );
};

export default TopDoctor;
