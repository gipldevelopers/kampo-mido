// services/admin/deposit.service.js

import API from "@/lib/api";

class DepositService {
  // Get deposits for a specific customer
  async getCustomerDeposits(customerId) {
    try {
      const response = await API.get(`/admin/deposits/customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get all deposits
  async getAllDeposits(params = {}) {
    try {
      const response = await API.get(`/admin/deposits/get-all`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Approve deposit
  async approveDeposit(depositId, notes = "") {
    try {
      const response = await API.put(`/admin/deposits/approve/${depositId}`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Reject deposit
  async rejectDeposit(depositId, notes = "") {
    try {
      const response = await API.put(`/admin/deposits/reject/${depositId}`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Process deposit (manual deposit entry)
  async processDeposit(depositId, notes = "") {
    try {
      const response = await API.post(`/admin/deposits/process/${depositId}`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get deposit by ID
  async getDepositById(depositId) {
    try {
      const response = await API.get(`/admin/deposits/view/${depositId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update deposit
  async updateDeposit(depositId, depositData) {
    try {
      const response = await API.put(`/admin/deposits/update/${depositId}`, depositData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete deposit
  async deleteDeposit(depositId) {
    try {
      const response = await API.delete(`/admin/deposits/delete/${depositId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Create deposit (admin manual entry)
DepositService.prototype.createDeposit = async function(depositData) {
  try {
    const response = await API.post(`/admin/deposits/create`, depositData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default new DepositService();

