import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axios';
import './AuthForm.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Sending:", formData);

      // FINAL CORRECT URLs
      let url = "/api/auth/register"; // patient

      if (formData.role === "doctor") {
        url = "/api/auth/register-doctor";
      }

      if (formData.role === "admin") {
        url = "/api/auth/register-admin"; 
      }

      const { data } = await api.post(url, formData);

      const role = data?.role || formData.role;

      toast.success(`Registered as ${role}! Now login.`);

      if (role === "doctor") navigate("/doctor-login");
      else if (role === "admin") navigate("/admin-login");
      else navigate("/patient-login");

    } catch (error) {
      console.error("Register error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <Toaster position="top-center" />

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register as {formData.role.toUpperCase()}</h2>

        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" required onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="email" required onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" required onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Register as</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit">Register</button>

        <p>
          Already have an account?{" "}
          {formData.role === "doctor" ? (
            <Link to="/doctor-login">Login here</Link>
          ) : formData.role === "admin" ? (
            <Link to="/admin-login">Login here</Link>
          ) : (
            <Link to="/patient-login">Login here</Link>
          )}
        </p>
      </form>
    </div>
  );
};

export default Register;
