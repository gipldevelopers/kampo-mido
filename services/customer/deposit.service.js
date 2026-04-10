// services/customer/deposit.service.js

import API from "@/lib/api";

class DepositService {
  // Submit deposit request
  async submitDeposit(depositData) {
    try {
      const formData = new FormData();
      
      // Required fields
      formData.append("amount", depositData.amount);
      formData.append("depositDate", depositData.depositDate);
      
      // Optional fields - only add if provided
      if (depositData.upiReference && depositData.upiReference.trim()) {
        formData.append("upiReference", depositData.upiReference.trim());
      }
      
      if (depositData.screenshot) {
        formData.append("screenshot", depositData.screenshot);
      }
      
      const response = await API.post("/customer/deposit/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get deposit history
  async getDepositHistory() {
    try {
      const response = await API.get("/customer/deposit/history");
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new DepositService();

