// services/customer/wallet.service.js
import API from "@/lib/api";

class WalletService {
  // Get complete wallet dashboard data
  async getWalletDashboard() {
    try {
      const response = await API.get("/customer/wallet/dashboard");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get wallet summary
  async getWalletSummary() {
    try {
      const response = await API.get("/customer/wallet/summary");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get conversion history with pagination
  async getConversionHistory(page = 1, limit = 10, type = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (type) {
        params.append("type", type);
      }

      const response = await API.get(`/customer/wallet/conversion-history?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get current gold rate
  async getCurrentGoldRate() {
    try {
      const response = await API.get("/customer/wallet/gold-rate");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get wallet stats for dashboard cards
  async getWalletStats() {
    try {
      const response = await API.get("/customer/wallet/stats");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get profit/loss calculation
  async getProfitLoss() {
    try {
      const response = await API.get("/customer/wallet/profit-loss");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get KYC status
  async getKYCStatus() {
    try {
      const response = await API.get("/customer/kyc/status");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get profile information
  async getProfile() {
    try {
      const response = await API.get("/customer/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new WalletService();