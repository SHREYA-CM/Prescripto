// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import Footer from "./components/Footer";
import Careers from "./pages/Careers";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorProfile from "./pages/DoctorProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// 🔥 NEW PAGES (Admin verification + Pending screen)
import AdminDoctorVerification from "./pages/AdminDoctorVerification";
import DoctorPending from "./pages/DoctorPending";

// 🔥 NEW PAGE: Registered Patients list
import AdminPatients from "./pages/AdminPatients";

const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <Navbar />

      <Routes>
        {/* ---------------- PUBLIC PAGES ---------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />

        {/* ---------------- AUTH PAGES ---------------- */}
        <Route path="/patient-login" element={<Login />} />
        <Route path="/doctor-login" element={<Login />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Forgot / Reset password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ---------------- ADMIN ROUTES ---------------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Doctor document verification page */}
        <Route
          path="/admin/doctor-verification"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDoctorVerification />
            </ProtectedRoute>
          }
        />

        {/* Registered patients page */}
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPatients />
            </ProtectedRoute>
          }
        />

        {/* ---------------- DOCTOR ROUTES ---------------- */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Doctor Pending Page (no protected route) */}
        <Route path="/doctor-pending" element={<DoctorPending />} />

        {/* ---------------- PATIENT ROUTES ---------------- */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-profile"
          element={
            <ProtectedRoute requiredRole="patient">
              <MyProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute requiredRole="patient">
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointment/:docId"
          element={
            <ProtectedRoute requiredRole="patient">
              <Appointment />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
