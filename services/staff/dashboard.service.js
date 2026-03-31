// services/staff/dashboard.service.js
import API from "@/lib/api";

class StaffDashboardService {
  async getDashboardData() {
    try {
      const response = await API.get('/staff/dashboard/get-data');
      return response.data;
    } catch (error) {
      console.error('Get staff dashboard error:', error);
      throw error;
    }
  }
}

export default new StaffDashboardService();
