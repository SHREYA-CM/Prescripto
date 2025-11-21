import React, { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import { AppContext } from "../context/AppContext.jsx";
import "./AuthForm.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AppContext);

  // detect which login page
  const isAdminLogin = location.pathname === "/admin-login";
  const isDoctorLogin = location.pathname === "/doctor-login";
  const isPatientLogin = location.pathname === "/patient-login";

  let title = "Patient Login";
  if (isAdminLogin) title = "Admin Login";
  if (isDoctorLogin) title = "Doctor Login";

  const showRegisterLink = isPatientLogin;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let endpoint = "/api/auth/login"; // default: patient login
      if (isDoctorLogin) endpoint = "/api/auth/doctor-login";
      if (isAdminLogin) endpoint = "/api/auth/admin-login";

      const res = await api.post(endpoint, {
        email: formData.email,
        password: formData.password,
      });

      // backend returns token + user fields; be defensive about shape
      const data = res.data || {};

      // Build userInfo from response in a resilient way
      const userInfo = {
        _id: data._id || data.id || null,
        name: data.name || data.user?.name || "",
        email: data.email || data.user?.email || formData.email,
        role: data.role || "patient",
        token: data.token || data.accessToken || null,
      };

      if (!userInfo.token) {
        throw new Error("No token returned from server");
      }

      // Save to localStorage (single source of truth)
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      // Update context (so all components have the user + token)
      login(userInfo, userInfo.token);

      toast.success("Login successful!");

      // redirects
      if (userInfo.role === "admin") navigate("/admin");
      else if (userInfo.role === "doctor") navigate("/doctor");
      else navigate("/patient"); // keep your existing route structure

    } catch (error) {
      console.error("Login error:", error);
      // Prefer backend message if available
      const message =
        error.response?.data?.message ||
        error.message ||
        "Invalid credentials";
      toast.error(message);
    }
  };

  return (
    <div className="auth-container">
      <Toaster position="top-center" />

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{title}</h2>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            required
            onChange={handleChange}
            value={formData.email}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            required
            onChange={handleChange}
            value={formData.password}
          />
        </div>

        <button type="submit">Login</button>

        {showRegisterLink && (
          <p>
            Don't have an account?{" "}
            <Link to="/register">Register here</Link>
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
