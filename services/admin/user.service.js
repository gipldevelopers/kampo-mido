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

  // Get all users with pagination
  async getAllUsers(page = 1, limit = 20) {
    try {
      const response = await API.get("/admin/users", {
        params: {
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();

