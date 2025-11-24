// src/api/axios.js
import axios from "axios";

// Same-origin baseURL so it works both locally and on Render
// - Locally: if frontend and backend are served from same origin, /api/... hits backend
// - Render: https://prescripto-1-1xez.onrender.com + /api/... => correct backend
const api = axios.create({
  baseURL: "", // IMPORTANT: keep this empty for same-origin
  withCredentials: true,
});

// Token Interceptor: reads token from the single source of truth (userInfo)
api.interceptors.request.use(
  (config) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore JSON parse errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
