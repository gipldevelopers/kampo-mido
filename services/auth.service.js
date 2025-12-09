// services/auth.service.js

import API from "@/lib/api";

class AuthService {
  // Get stored user from localStorage
  getStoredUser() {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  // Get stored token from localStorage
  getStoredToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getStoredToken();
    return !!token;
  }

  // Get current user (from localStorage or API)
  async getCurrentUser() {
    const storedUser = this.getStoredUser();
    if (storedUser && this.isAuthenticated()) {
      try {
        // Optionally verify token with backend
        const response = await API.get("/auth/me");
        return response.data;
      } catch (error) {
        // If token is invalid, clear storage
        if (error.response?.status === 401) {
          this.logout();
          return null;
        }
        // Return stored user if API call fails (offline mode)
        return storedUser;
      }
    }
    return null;
  }

  // Login user
  async login(email, password) {
    try {
      const response = await API.post("/auth/login", { email, password });
      const { user, token } = response.data;

      // Store token and user
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await API.post("/auth/register", userData);
      const { user, token } = response.data;

      // Store token and user
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await API.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const response = await API.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Change password (authenticated user)
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await API.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await API.post("/auth/refresh");
      const { token } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      return token;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();

