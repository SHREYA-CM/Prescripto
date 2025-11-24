// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const storedUserInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  })();

  const [user, setUser] = useState(storedUserInfo || null);
  const [token, setToken] = useState(storedUserInfo?.token || null);

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await api.get("/api/doctors");
        const data = response?.data;
        const list = data?.doctors || data?.data || data || [];
        setDoctors(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token || !user || user.role !== "patient") {
        setAppointments([]);
        return;
      }

      try {
        setLoadingAppointments(true);

        const response = await api.get("/api/appointments/mybookings");
        const data = response?.data;
        const list = data?.appointments || data?.data || data || [];
        setAppointments(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [token, user]);

  const login = (userData, userToken) => {
    const userInfo = { ...userData, token: userToken };
    try {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } catch (e) {
      console.error("Failed to save userInfo to localStorage", e);
    }

    setUser(userInfo);
    setToken(userToken);
  };

  const logout = () => {
    try {
      localStorage.removeItem("userInfo");
    } catch (e) {
      console.error("Failed to remove userInfo from localStorage", e);
    }
    setUser(null);
    setToken(null);
    setAppointments([]);
  };

  const value = {
    user,
    token,
    doctors,
    appointments,
    loadingDoctors,
    loadingAppointments,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
