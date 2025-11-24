import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import "./DoctorPending.css";
import toast from "react-hot-toast";

const DoctorPending = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If somehow doctor is approved, redirect automatically
    if (user?.role === "doctor" && user?.status === "approved") {
      navigate("/doctor");
    }
  }, [user, navigate]);

  return (
    <div className="pending-container">
      <div className="pending-card">
        <h1>⏳ Verification in Progress</h1>

        <p className="waiting-text">
          Hello <b>{user?.name}</b>, your doctor account is currently
          <span className="pending-pill">Pending Approval</span>.
        </p>

        <p className="desc">
          Our admin team is reviewing your submitted documents (Photo, ID Proof,
          Medical Degree).  
          <br />
          Once approved, you will gain full access to your Doctor Dashboard.
        </p>

        <div className="checklist">
          <div className="check-item">✔ Profile Photo Uploaded</div>
          <div className="check-item">✔ ID Proof Submitted</div>
          <div className="check-item">✔ Degree Certificate Uploaded</div>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/doctor-login")}
        >
          Back to Login
        </button>

        <p className="footer-note">
          If approval takes longer than expected, please contact support.
        </p>
      </div>
    </div>
  );
};

export default DoctorPending;
