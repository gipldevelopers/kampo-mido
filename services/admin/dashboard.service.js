// services/admin/dashboard.service.js
import API from "@/lib/api";

class DashboardService {
  // Get complete dashboard data
  async getDashboardData() {
    try {
      const response = await API.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard error:', error);
      throw error;
    }
  }

  // Get only statistics
  async getDashboardStats() {
    try {
      const response = await API.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  // Get specific chart data
  async getChartData(chartType) {
    try {
      const response = await API.get(`/admin/dashboard/charts?chartType=${chartType}`);
      return response.data;
    } catch (error) {
      console.error('Get chart data error:', error);
      throw error;
    }
  }

  // Get recent transactions
  async getRecentTransactions(limit = 5) {
    try {
      const response = await API.get(`/admin/dashboard/transactions?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get recent transactions error:', error);
      throw error;
    }
  }

  // Get recent activity
  async getRecentActivity(limit = 5) {
    try {
      const response = await API.get(`/admin/dashboard/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get recent activity error:', error);
      throw error;
    }
  }

  // Quick actions
  async addCustomer(customerData) {
    try {
      const response = await API.post('/admin/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('Add customer error:', error);
      throw error;
    }
  }

  async addDeposit(depositData) {
    try {
      const response = await API.post('/admin/deposits', depositData);
      return response.data;
    } catch (error) {
      console.error('Add deposit error:', error);
      throw error;
    }
  }

  async updateGoldRate(rateData) {
    try {
      const response = await API.post('/admin/gold-rates', rateData);
      return response.data;
    } catch (error) {
      console.error('Update gold rate error:', error);
      throw error;
    }
  }
}

export default new DashboardService();