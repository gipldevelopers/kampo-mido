// services/admin/user.service.js

import API from "@/lib/api";

class UserService {
  // Register a new user
  async register(userData) {
    try {
      const response = await API.post("/admin/users/register", {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        status: userData.status,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get all users
  async getAllUsers() {
    try {
      const response = await API.get("/admin/users/get-all-users", {
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await API.get(`/admin/users/view-user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await API.put(`/admin/users/update-user/${userId}`, {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        status: userData.status,
        phone: userData.phone,
        address: userData.address,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await API.delete(`/admin/users/delete-user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();