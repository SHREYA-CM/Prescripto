import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ManageDoctors.css';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const { backendurl } = useContext(AdminContext);
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    try { // 👇 Added try/catch for better error handling
      const response = await axios.get(`${backendurl}/api/doctor/list`, { headers: { token } });
      if (response.data.success) {
        setDoctors(response.data.data);
      } else {
        toast.error("Failed to fetch doctors list."); // Added specific error
      }
    } catch (error) {
        toast.error("An error occurred while fetching doctors.");
    }
  };

  const removeDoctor = async (doctorId) => {
    try {
      const response = await axios.post(`${backendurl}/api/doctor/remove`, { id: doctorId }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchDoctors();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
        toast.error("An error occurred while removing the doctor.");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="doctor-list page-content">
      <div className="list-header">
        <h2>All Doctors</h2>
        <button onClick={() => navigate('/doctors/add')} className="add-button">
          Add Doctor
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor._id}>
              <td>{doctor.name}</td>
              <td>{doctor.specialization}</td>
              <td>{doctor.email}</td>
              <td className="actions">
                <button onClick={() => navigate(`/doctors/edit/${doctor._id}`)} className="edit-btn">Edit</button>
                <button onClick={() => removeDoctor(doctor._id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageDoctors;