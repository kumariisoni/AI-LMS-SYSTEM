import axios from "axios";

// Automatically resolve and normalize API base URL
let rawUrl = import.meta.env.VITE_API_URL;
let apiUrl;

if (rawUrl && typeof rawUrl === "string" && rawUrl.trim().length > 0) {
  apiUrl = rawUrl.trim().replace(/\/+$/, "");
  if (!apiUrl.endsWith("/api")) {
    apiUrl = `${apiUrl}/api`;
  }
} else {
  apiUrl = import.meta.env.PROD
    ? "https://ai-lms-backend-u52h.onrender.com/api"
    : "http://localhost:5291/api";
}

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT Authorization header
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

// Response interceptor to handle expired or rejected tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: clear auth on unauthorized
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
