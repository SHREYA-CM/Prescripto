import React from 'react';
import { specialityData } from '../assets/assets';
import { NavLink } from 'react-router-dom';

const SpecialityMenu = () => {
  return (
    <div className='py-12'>
      <h1 className='text-center text-3xl font-bold text-gray-800 mb-2'>Find by Speciality</h1>
      <p className='text-center text-gray-600 mb-8'>
        Simply browse through our extensive list of trusted doctors, and schedule your appointment hassle-free.
      </p>

      {/* FLEX version: tight spacing */}
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-4">
        {specialityData.map((item, index) => (
          <NavLink to={`/doctors/${item.speciality}`} key={index}>
            <div className="flex flex-col items-center text-center p-1 cursor-pointer">
              <div className="w-14 h-14 flex items-center justify-center mb-1">
                <img
                  src={item.image}
                  alt={item.speciality}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <p className="font-semibold text-gray-700 text-sm">{item.speciality}</p>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
