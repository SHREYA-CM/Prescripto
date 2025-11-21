import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AppContext);
  const location = useLocation();
  
  const [showToast, setShowToast] = useState(null);

  // Run toast in effect (NOT during render)
  useEffect(() => {
    if (showToast) {
      toast.error(showToast);
      setShowToast(null);
    }
  }, [showToast]);

  // 1️⃣ User NOT logged in
  if (!user) {
    setShowToast("Please login to continue.");

    if (requiredRole === "admin")
      return <Navigate to="/admin-login" replace />;

    if (requiredRole === "doctor")
      return <Navigate to="/doctor-login" replace />;

    return <Navigate to="/patient-login" replace />;
  }

  // 2️⃣ User logged in BUT role mismatch
  if (requiredRole && user.role !== requiredRole) {
    setShowToast(`${requiredRole.toUpperCase()} access only.`);

    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "doctor") return <Navigate to="/doctor" replace />;
    return <Navigate to="/patient" replace />;
  }

  // 3️⃣ Everything correct → allow page
  return children;
};

export default ProtectedRoute;
