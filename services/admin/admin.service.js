// services/admin/admin.service.js
import API from "@/lib/api";

class AdminService {
  // Get all admins
  async getAllAdmins(params = {}) {
    try {
      const response = await API.get("/admin/admins/get-all", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get admin by ID
  async getAdminById(adminId) {
    try {
      const response = await API.get(`/admin/admins/view/${adminId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create new admin
  async createAdmin(adminData) {
    try {
      const response = await API.post("/admin/admins/create", adminData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update admin
  async updateAdmin(adminId, adminData) {
    try {
      const response = await API.put(`/admin/admins/update/${adminId}`, adminData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete admin
  async deleteAdmin(adminId) {
    try {
      const response = await API.delete(`/admin/admins/delete/${adminId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AdminService();
