import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext);
  const [relDocs, setRelDocs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      );
      setRelDocs(doctorsData);
    }
  }, [doctors, speciality, docId]);

  if (relDocs.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-6">
        No related doctors found in this speciality.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Related Doctors</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {relDocs.map((item) => (
          <div
            key={item._id}
            onClick={() => navigate(`/appointment/${item._id}`)}
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
              <p className="text-xs text-gray-400">{item.experience} experience</p>
              <p className="text-xs text-yellow-600">⭐ {item.rating || "4.5"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedDoctors;
