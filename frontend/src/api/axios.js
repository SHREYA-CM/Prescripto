import axios from "axios";

// Yaha baseURL sirf SAME ORIGIN rakha hai
// Matlab:
// - Local pe agar tum server se hi frontend serve karogi -> /api/... backend hit karega
// - Render pe: https://prescripto-1-1xez.onrender.com + /api/...  == sahi backend
const api = axios.create({
  baseURL: "",      // ❗IMPORTANT: yaha kuch nahi, sirf khali string
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
