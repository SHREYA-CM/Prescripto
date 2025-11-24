import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import "./AuthForm.css";

const ResetPassword = () => {
  const { token } = useParams(); // /reset-password/:token
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwords.password || !passwords.confirmPassword) {
      return toast.error("Please fill both fields");
    }

    if (passwords.password !== passwords.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (passwords.password.length < 6) {
      return toast.error("Password should be at least 6 characters");
    }

    try {
      setLoading(true);

      await api.post(`/api/auth/reset-password/${token}`, {
        password: passwords.password,
      });

      toast.success("Password reset successful! Please login.");

      setTimeout(() => {
        navigate("/patient-login");
      }, 1000);
    } catch (error) {
      console.error("Reset password error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Toaster position="top-center" />

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            name="password"
            value={passwords.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>

        <div className="form-footer" style={{ marginTop: "1rem" }}>
          <span>Go back to </span>
          <Link to="/patient-login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
