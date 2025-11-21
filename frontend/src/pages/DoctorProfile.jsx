import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import { AppContext } from "../context/AppContext.jsx";
import "./DoctorProfile.css";

const DoctorProfile = () => {
  const { id } = useParams(); // This is USER ID
  const { token, user } = useContext(AppContext);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const timeSlots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/api/doctor/${id}`);

        const d = res.data?.data || res.data?.doctor || res.data;

        if (d) {
          setDoctor({
            ...d,
            doctorId: d._id, // SAVE REAL DOCTOR MODEL ID
          });
        } else {
          toast.error("Doctor not found");
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
        toast.error("Failed to load doctor details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      return toast.error("Please select a date and time slot.");
    }

    if (!user || user.role !== "patient") {
      toast.error("Please login as a patient.");
      return;
    }

    if (!token) {
      toast.error("Session expired. Login again.");
      return;
    }

    try {
      const res = await api.post(
        "/api/appointments",
        {
          doctorId: doctor.doctorId, // REAL DOCTOR ID
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Appointment booked successfully!");

      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong while booking."
      );
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <h1>Loading Profile...</h1>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="profile-container">
        <h1>Doctor Not Found</h1>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Toaster position="top-center" />

      <header className="profile-main-header">
        <Link to="/doctors" className="back-link">
          ← Back to Doctors
        </Link>
      </header>

      <main className="profile-container">
        <div className="profile-card">
          {/* Doctor Top */}
          <div className="profile-header">
            <img
              src={
                doctor.image ||
                "https://placehold.co/150x150/E2E8F0/4A5568?text=Photo"
              }
              alt={doctor.name}
              className="profile-image"
            />

            <div className="doctor-info">
              <h1 className="doctor-name">{doctor.name}</h1>
              <p className="doctor-speciality">{doctor.speciality}</p>

              <p className="doctor-experience">
                <strong>Experience:</strong> {doctor.experience} years
              </p>

              {doctor.fees && (
                <p className="doctor-experience">
                  <strong>Consultation Fee:</strong> ₹{doctor.fees}
                </p>
              )}
            </div>
          </div>

          {/* About */}
          <div className="profile-body">
            <div className="section">
              <h2>About Me</h2>
              <p>{doctor.about || "No information available."}</p>
            </div>

            {/* Address */}
            <div className="section">
              <h2>Clinic Address</h2>
              <p>
                {doctor.address?.line1 || "Address not available"}
                {doctor.address?.line2 && `, ${doctor.address.line2}`}
              </p>
            </div>

            {/* Booking Section */}
            <div className="section booking-section">
              <h2>Book an Appointment</h2>

              {!doctor.isAvailable && (
                <p className="not-available">
                  This doctor is currently not accepting appointments.
                </p>
              )}

              {/* Date */}
              <div className="input-group">
                <label>Select Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="date-input"
                  disabled={!doctor.isAvailable}
                />
              </div>

              {/* Time */}
              <div className="input-group">
                <label>Select Time Slot:</label>

                <div className="time-slots-container">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      className={
                        selectedTime === time
                          ? "time-slot-btn selected"
                          : "time-slot-btn"
                      }
                      onClick={() => setSelectedTime(time)}
                      disabled={!doctor.isAvailable}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="confirm-booking-btn"
                disabled={!doctor.isAvailable}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorProfile;
