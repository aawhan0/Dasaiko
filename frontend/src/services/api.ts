import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// -------------------------
// Request Interceptor
// -------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------
// Response Interceptor
// -------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API ERROR]", error);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Body:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;