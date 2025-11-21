import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000", // backend base URL
});

// Token Interceptor: reads token from the single source of truth (userInfo)
api.interceptors.request.use((config) => {
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
}, (error) => {
  return Promise.reject(error);
});

export default api;
