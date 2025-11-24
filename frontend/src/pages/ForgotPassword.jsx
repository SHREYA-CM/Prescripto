import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import "./AuthForm.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    try {
      setLoading(true);

      await api.post("/api/auth/forgot-password", { email });

      toast.success("Reset link sent to your email (if account exists)");
      setEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset link";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Toaster position="top-center" />

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="form-footer" style={{ marginTop: "1rem" }}>
          <span>Remembered your password? </span>
          <Link to="/patient-login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
