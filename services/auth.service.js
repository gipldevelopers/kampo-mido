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

  // Login user with email/password OR phone/password
  async login(credentials) {
    try {
      // Determine if login is with email or phone
      const payload = {};

      if (credentials.email) {
        payload.email = credentials.email;
      } else if (credentials.phone) {
        payload.phone = credentials.phone;
      } else {
        throw new Error("Either email or phone is required");
      }

      payload.password = credentials.password;

      const response = await API.post("/auth/login", payload);

      // API response structure: { success, message, data: { user, token } }
      let user, token;

      if (response.data && response.data.data) {
        user = response.data.data.user;
        token = response.data.data.token;
      }

      // Validate response data
      if (!user) {
        console.error("Login response:", response.data);
        throw new Error("Invalid response: Missing user data");
      }

      if (!token) {
        console.error("Login response:", response.data);
        throw new Error("Invalid response: Missing token");
      }

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
  async logout() {
    try {
      // Call logout API if token exists
      if (this.isAuthenticated()) {
        await API.post("/auth/logout");
      }
    } catch (error) {
      // Even if API call fails, clear local storage
      console.error("Logout API error:", error);
    } finally {
      // Always clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
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

  // Reset password with token
  async resetPasswordToken(token, newPassword, confirmPassword) {
    try {
      const response = await API.post("/auth/reset-password-token", {
        token,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();