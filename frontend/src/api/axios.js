import axios from "axios";

// 🔥 Automatically choose correct base URL:
// - Localhost during development
// - "/api" when deployed on Render
const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://127.0.0.1:5000/api"  // local backend
      : "/api",                      // Render backend
  withCredentials: true,
});

// 🔐 Token Interceptor
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
      // ignore JSON errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
