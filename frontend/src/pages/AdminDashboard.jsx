// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext.jsx";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
  });

  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      toast.error("Admin access only");
      navigate("/admin-login");
      return;
    }

    fetchSummary();
  }, [token, user, navigate]);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/api/admin/analytics/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSummary(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard stats");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Manage doctors, patients and appointments.</p>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>👨‍⚕️ Doctors</h3>
          <p>{summary.totalDoctors}</p>
        </div>

        <div className="stat-card">
          <h3>👥 Patients</h3>
          <p>{summary.totalPatients}</p>
        </div>

        <div className="stat-card">
          <h3>📅 Appointments</h3>
          <p>{summary.totalAppointments}</p>
        </div>
      </div>

      <div className="admin-actions">
        <Link to="/admin/doctor-verification" className="admin-action-card">
          <h3>📄 Doctor Verification</h3>
          <p>Approve or reject doctor registrations</p>
        </Link>

        <Link to="/admin/doctors" className="admin-action-card">
          <h3>👨‍⚕️ All Doctors</h3>
          <p>View all registered doctors</p>
        </Link>

        <Link to="/admin/patients" className="admin-action-card">
          <h3>👥 Registered Patients</h3>
          <p>View and manage all patients</p>
        </Link>

        <Link to="/admin/appointments" className="admin-action-card">
          <h3>📅 All Appointments</h3>
          <p>Monitor every appointment</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
