// src/pages/Login.jsx
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

  // --- Which login screen? ---
  const isAdminLogin = location.pathname === "/admin-login";
  const isDoctorLogin = location.pathname === "/doctor-login";
  const isPatientLogin = location.pathname === "/patient-login";

  let title = "Patient Login";
  if (isAdminLogin) title = "Admin Login";
  if (isDoctorLogin) title = "Doctor Login";

  const showRegisterLink = isPatientLogin;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // --- choose backend endpoint ---
      let endpoint = "/api/auth/login"; // default: patient
      if (isDoctorLogin) {
        endpoint = "/api/auth/doctor-login";
      } else if (isAdminLogin) {
        endpoint = "/api/auth/admin-login";
      }

      const res = await api.post(endpoint, {
        email: formData.email,
        password: formData.password,
      });

      const data = res.data || {};

      // --- build userInfo object ---
      const roleFromPath = isDoctorLogin
        ? "doctor"
        : isAdminLogin
        ? "admin"
        : "patient";

      const userInfo = {
        _id: data._id || data.id || data.user?._id || null,
        name: data.name || data.user?.name || "",
        email: data.email || data.user?.email || formData.email,
        role: data.role || roleFromPath,
        token: data.token || data.accessToken || null,
        // doctor-status (for approval flow) – backend should send this
        status:
          data.status ||
          data.user?.status ||
          data.doctor?.status ||
          null,
      };

      if (!userInfo.token) {
        throw new Error("No token returned from server");
      }

      // save + context
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      login(userInfo, userInfo.token);

      toast.success("Login successful!");

      // --- redirect based on role ---
      if (userInfo.role === "admin") {
        navigate("/admin");
        return;
      }

      if (userInfo.role === "doctor") {
        // if backend sends status: 'pending' / 'approved' / 'rejected'
        const status = userInfo.status || "approved"; // fallback so old data still works
        if (status !== "approved") {
          toast(
            "Your doctor account is pending admin approval. You can't access dashboard yet.",
            { icon: "⏳" }
          );
          navigate("/doctor-pending");
          return;
        }

        navigate("/doctor");
        return;
      }

      // default: patient
      navigate("/patient");
    } catch (error) {
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

          <Link to="/forgot-password" className="forgot-link">
            Forgot Password?
          </Link>
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
