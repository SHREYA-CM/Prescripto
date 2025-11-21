import React, { useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';

// utility: convert text to URL slug
const toSlug = (text = '') => text.toLowerCase().replace(/\s+/g, '-');

const DoctorCard = ({ doctor, onClick }) => {
  const available = doctor.isAvailable !== false; // default: available if field missing

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition transform p-4 flex flex-col items-center text-center cursor-pointer"
    >
      <img
        src={
          doctor.image ||
          'https://placehold.co/100x100/E2E8F0/4A5568?text=Dr'
        }
        alt={`${doctor.name} - ${doctor.speciality}`}
        className="w-24 h-24 rounded-full object-cover mb-3"
      />
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              available ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></span>
          <p className={available ? 'text-green-600' : 'text-red-600'}>
            {available ? 'Available' : 'Not Available'}
          </p>
        </div>
        <p className="font-semibold">{doctor.name}</p>
        <p className="text-sm text-gray-500">{doctor.speciality}</p>
        {doctor.experience !== undefined && (
          <p className="text-xs text-gray-400">
            {doctor.experience} yrs experience
          </p>
        )}
      </div>
    </div>
  );
};

const Doctor = () => {
  const { speciality } = useParams(); // slug from URL e.g. /doctors/dermatologist
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  // static specialities (can later be dynamic)
  const specialities = [
    'All',
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist',
  ];

  const specialitySlugs = specialities.map((sp) => ({
    name: sp,
    slug: sp === 'All' ? 'all' : toSlug(sp),
  }));

  // filter doctors by speciality slug
  const filteredDoctors = useMemo(() => {
    if (!speciality || speciality === 'all') return doctors || [];

    return (doctors || []).filter(
      (doc) => toSlug(doc.speciality) === speciality
    );
  }, [speciality, doctors]);

  const currentSpeciality =
    specialitySlugs.find((s) => s.slug === speciality)?.name ||
    (speciality ? speciality : 'All');

  return (
    <div className="p-6">
      <p className="text-lg font-medium mb-6">
        Browse through specialist doctors
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with specialities */}
        <div className="md:col-span-1 flex flex-col gap-3">
          {specialitySlugs.map((sp) => (
            <button
              key={sp.slug}
              onClick={() =>
                sp.slug === 'all'
                  ? navigate('/doctors')
                  : navigate(`/doctors/${sp.slug}`)
              }
              className={`px-3 py-2 text-left rounded-md border transition ${
                (!speciality && sp.slug === 'all') || speciality === sp.slug
                  ? 'bg-green-100 border-green-400 text-green-700 font-medium'
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              {sp.name}
            </button>
          ))}
        </div>

        {/* Doctors grid */}
        <div className="md:col-span-3">
          {(!doctors || doctors.length === 0) && (
            <p className="text-gray-500">
              No doctors available at the moment.
            </p>
          )}

          {doctors && doctors.length > 0 && filteredDoctors.length === 0 && (
            <p className="text-gray-500">
              No doctors available for{' '}
              <span className="font-semibold">{currentSpeciality}</span>.
            </p>
          )}

          {filteredDoctors.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Showing {filteredDoctors.length} doctor
                {filteredDoctors.length > 1 ? 's' : ''} for{' '}
                <span className="font-semibold">{currentSpeciality}</span>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((item) => (
                  <DoctorCard
                    key={item._id}
                    doctor={item}
                    // go to doctor profile page
                    onClick={() => navigate(`/doctor/${item._id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctor;
