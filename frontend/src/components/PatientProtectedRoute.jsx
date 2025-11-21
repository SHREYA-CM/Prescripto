import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function PatientProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    const verifyPatient = async () => {
      if (!token || role !== 'patient') {
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.post(
          '/api/v1/user/get-patient-info',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.data.success) {
          localStorage.clear();
        }
      } catch (error) {
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    verifyPatient();
  }, [token, role]);

  // Show nothing while verifying
  if (isLoading) return null;

  // If token exists and role is patient, allow access
  if (token && role === 'patient') {
    return children;
  }

  // Otherwise redirect to patient login
  return <Navigate to="/patient-login" replace />;
}

export default PatientProtectedRoute;
