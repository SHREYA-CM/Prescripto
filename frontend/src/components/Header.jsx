import React from 'react';
import { assets } from '../assets/assets';
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    // Main container: stacks vertically on mobile, horizontally on desktop (md:)
    <div className='flex flex-col-reverse md:flex-row items-center gap-8 py-12'>
      
      {/* ------ Left Side (Text Content) -------*/}
      <div className='flex-1 flex flex-col items-center md:items-start text-center md:text-left'>
        
        <h1 className='text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight'>
          Book Appointment <br/> With Trusted Doctors
        </h1>

        <div className='flex items-center gap-3 my-4'>
          {/* Group Photo */}
          <img src={assets.group_profiles} alt="User profiles" className='w-20'/>
          
          <p className='text-gray-600 text-sm'>
            Simply browse through our extensive list of trusted doctors,<br className ='hidden sm:block'/> and schedule your appointment hassle-free.
          </p>
        </div>
        

        <NavLink 
          to="/doctors" 
          className='inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition duration-300 mt-4'
        >
      
          Book Appointment <img className='w-3'/>
          <img src={assets.arrow_icon} alt="arrow" className='w-4'/>
          
        </NavLink>
      </div>
      
      {/* ------- Right Side (Image) -------*/}
      <div className='flex-1'>
        <img src={assets.header_img} alt="Doctors Illustration" className='w-full'/>
      </div>

    </div>
  );
};

export default Header;