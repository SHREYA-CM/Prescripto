import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";

const AppointmentModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  docInfo,
}) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];
  const timeSlots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 md:w-1/3">
        <h2 className="text-xl font-bold mb-4">Select Date & Time</h2>

        <label className="text-sm font-semibold">Date</label>
        <input
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border w-full px-3 py-2 mt-1 rounded mb-4"
        />

        <label className="text-sm font-semibold">Time</label>
        <div className="grid grid-cols-3 gap-2 mt-1 mb-4">
          {timeSlots.map((time) => (
            <button
              key={time}
              className={`border rounded py-2 ${
                selectedTime === time
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </button>
          ))}
        </div>

        {selectedDate && selectedTime && (
          <div className="bg-gray-50 p-3 rounded mb-4 text-sm text-gray-700">
            <p>
              Appointment with <b>{docInfo.name}</b>
            </p>
            <p>
              {selectedDate} at {selectedTime}
            </p>
            <p>Fee: ₹{docInfo.fees}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Appointment = () => {
  const { docId } = useParams();
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    if (doctors?.length) {
      const info = doctors.find((doc) => doc._id === docId);
      setDocInfo(info);
    }
  }, [doctors, docId]);

  if (!docInfo) {
    return (
      <div className="text-center py-16 text-xl text-gray-600">
        Loading Doctor Details...
      </div>
    );
  }

  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select date & time");
      return;
    }

    try {
      const res = await api.post("/api/appointments", {
        doctorId: docInfo._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
      });

      toast.success("Appointment booked successfully!");
      setIsModalOpen(false);

      setTimeout(() => navigate("/patient"), 800);
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <Toaster position="top-right" />

      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-blue-200 p-2 rounded-full">
            <img
              src={docInfo.image}
              alt={docInfo.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold flex items-center justify-center md:justify-start">
              {docInfo.name}
              <img src={assets.verified_icon} alt="" className="w-5 h-5 ml-2" />
            </h2>

            <p className="text-gray-600">
              {docInfo.degree} — {docInfo.speciality}
            </p>
            <p className="text-gray-500">{docInfo.experience}</p>

            <p className="text-blue-600 font-semibold mt-2">
              Fee: ₹{docInfo.fees}
            </p>

            <p className="text-gray-500 text-sm">
              {docInfo.address.line1}, {docInfo.address.line2}
            </p>
          </div>
        </div>

        <p className="mt-6 text-gray-700">{docInfo.about}</p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
        >
          Book Appointment
        </button>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAppointment}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        docInfo={docInfo}
      />

      <RelatedDoctors docid={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
