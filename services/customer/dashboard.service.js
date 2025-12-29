// services/customer/dashboard.service.js

import API from "@/lib/api";

class DashboardService {
  // Get dashboard summary
  async getDashboardSummary() {
    try {
      console.log('Making dashboard summary request...');
      const response = await API.get("/customer/dashboard/summary");
      console.log('Dashboard summary response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Dashboard summary error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Handle 401 specifically for UI feedback, but don't wipe storage here
      if (error.response?.status === 401) {
        throw new Error('SESSION_EXPIRED');
      }

      throw error;
    }
  }

  // Get gold value trend
  async getGoldValueTrend(period = "7days") {
    try {
      const response = await API.get(`/customer/dashboard/trend?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Trend error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('SESSION_EXPIRED');
      }

      throw error;
    }
  }

  // Get recent transactions
  async getRecentTransactions() {
    try {
      const response = await API.get("/customer/dashboard/transactions/recent");
      return response.data;
    } catch (error) {
      console.error('Transactions error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('SESSION_EXPIRED');
      }

      throw error;
    }
  }

  // Get quick stats
  async getQuickStats() {
    try {
      const response = await API.get("/customer/dashboard/quick-stats");
      return response.data;
    } catch (error) {
      console.error('Quick stats error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('SESSION_EXPIRED');
      }

      throw error;
    }
  }

  // Get portfolio performance
  async getPortfolioPerformance(period = "1month") {
    try {
      const response = await API.get(`/customer/dashboard/performance?period=${period}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('SESSION_EXPIRED');
      }
      throw error;
    }
  }

  // Get investment timeline
  async getInvestmentTimeline() {
    try {
      const response = await API.get("/customer/dashboard/timeline");
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('SESSION_EXPIRED');
      }
      throw error;
    }
  }

  // Get all dashboard data at once (optimized for initial load)
  async getAllDashboardData() {
    try {
      const [summary, trend, transactions, quickStats] = await Promise.all([
        this.getDashboardSummary(),
        this.getGoldValueTrend(),
        this.getRecentTransactions(),
        this.getQuickStats()
      ]);

      return {
        summary: summary.data,
        trend: trend.data,
        transactions: transactions.data,
        quickStats: quickStats.data
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new DashboardService();