// lib/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  timeout: 10000,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    // Check if we're in the browser (client-side)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        // Ensure headers object exists
        if (!config.headers) {
          config.headers = {};
        }

        // Handle token with or without Bearer prefix
        const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        config.headers.Authorization = authToken;

        console.log("API Request with token:", token.substring(0, 10) + "..."); // Debug
      } else {
        console.log("API Request: No token found");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Check if we're in the browser (client-side)
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        console.log("401 Unauthorized - Token may be invalid or expired");

        const isDashboardRequest = error.config?.url?.includes('/dashboard');

        if (!isDashboardRequest) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;