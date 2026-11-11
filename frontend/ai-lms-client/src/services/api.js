import axios from "axios";

const defaultApiUrl = import.meta.env.PROD
  ? "/api"
  : "http://localhost:5291/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
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
      const isAuthEndpoint = error.config?.url?.includes("/auth/login");
      if (!isAuthEndpoint) {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;