import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  const { user, logout, doctors: contextDoctors, loadingDoctors } = useContext(AppContext);

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      navigate('/patient-login');
    }
  }, [navigate, user]);

  useEffect(() => {
    if (Array.isArray(contextDoctors) && contextDoctors.length > 0) {
      setDoctors(contextDoctors);
      return;
    }

    const fetchDoctors = async () => {
      try {
        const res = await api.get('/api/doctors');
        const list = res.data?.doctors || res.data?.data || res.data || [];
        setDoctors(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      }
    };

    fetchDoctors();
  }, [contextDoctors]);

  if (!user) return null;

  return (
    <>
      {/* INTERNAL RESPONSIVE CSS */}
      <style>{`
        .patient-page {
          font-family: Segoe UI, sans-serif;
          background: #f5f7f9;
          min-height: 100vh;
          padding: 1rem;
        }

        .page-title {
          text-align: center;
          margin-top: 1rem;
          font-size: 2rem;
          font-weight: bold;
          color: #333;
        }

        .page-subtitle {
          text-align: center;
          margin-top: -5px;
          margin-bottom: 2rem;
          color: #666;
        }

        .doctor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
          padding: 0 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .doctor-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .doctor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.15);
        }

        .doctor-card h3 {
          margin: 0;
          color: #007bff;
        }

        .doctor-speciality {
          font-style: italic;
          color: #555;
          margin: 0.3rem 0;
        }

        .book-btn {
          width: 100%;
          padding: 0.8rem;
          margin-top: 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
        }

        @media(max-width: 480px) {
          .page-title {
            font-size: 1.6rem;
          }
          .doctor-card {
            padding: 1.2rem;
          }
        }
      `}</style>

      <div className="patient-page">

        <h1 className="page-title">Our Doctors</h1>
        <p className="page-subtitle">Book appointments with top specialists</p>

        <div className="doctor-grid">
          {loadingDoctors ? (
            <p style={{ textAlign: "center", marginTop: "40px" }}>
              Loading doctors...
            </p>
          ) : doctors.length > 0 ? (
            doctors.map((doctor) => (
              <Link
                to={`/appointment/${doctor._id || doctor.userId || doctor.user?._id}`}
                key={doctor._id || doctor.userId || doctor.user?._id}
                style={{ textDecoration: "none" }}
              >
                <div className="doctor-card">
                  <h3>{doctor.name || doctor.user?.name}</h3>

                  <p className="doctor-speciality">
                    {doctor.speciality || "General Physician"}
                  </p>

                  <p><b>Experience:</b> {doctor.experience || 0} years</p>
                  <p><b>Consultation Fee:</b> ₹{doctor.fees || 500}</p>

                  <button className="book-btn">
                    Book Appointment
                  </button>
                </div>
              </Link>
            ))
          ) : (
            <p style={{ textAlign: "center", marginTop: "40px" }}>No doctors found.</p>
          )}
        </div>

      </div>
    </>
  );
};

export default PatientDashboard;
