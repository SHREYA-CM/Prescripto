import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Doctors from './pages/Doctors';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import MyProfile from './pages/MyProfile';       // 🔹 fixed case
import MyAppointments from './pages/MyAppointments';
import Appointment from './pages/Appointment';
import Footer from './components/Footer';
import Careers from './pages/Careers';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorProfile from './pages/DoctorProfile';  // 🔹 NEW: doctor detail + booking page
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <Navbar />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />

        {/* Doctor profile + booking (from doctor cards) */}
        <Route path="/doctor/:id" element={<DoctorProfile />} />

        {/* Authentication */}
        <Route path="/patient-login" element={<Login />} />
        <Route path="/doctor-login" element={<Login />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient"
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Patient Routes */}
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
