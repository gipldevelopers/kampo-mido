// services/customer/withdrawals.service.js
import API from "@/lib/api";

class WithdrawalsService {
  // Create withdrawal request
  async createWithdrawal(withdrawalData) {
    try {
      const response = await API.post("/customer/withdrawals/create", withdrawalData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get withdrawal history
  async getWithdrawalHistory(page = 1, limit = 10, type = null, status = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (type && type !== 'all') {
        params.append("type", type);
      }
      
      if (status && status !== 'all') {
        params.append("status", status);
      }
      
      const response = await API.get(`/customer/withdrawals/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get withdrawal by ID
  async getWithdrawalById(id) {
    try {
      const response = await API.get(`/customer/withdrawals/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cancel withdrawal
  async cancelWithdrawal(id) {
    try {
      const response = await API.post(`/customer/withdrawals/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get withdrawal summary
  async getWithdrawalSummary() {
    try {
      const response = await API.get("/customer/withdrawals/summary");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Check available gold
  async checkAvailableGold() {
    try {
      const response = await API.get("/customer/withdrawals/available-gold");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Calculate withdrawal
  async calculateWithdrawal(type, amount = null, grams = null) {
    try {
      const response = await API.post("/customer/withdrawals/calculate", {
        type,
        amount,
        grams
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Validate withdrawal before submission
  async validateWithdrawal(type, amount, grams, availableGold, currentGoldRate) {
    try {
      if (type === 'money') {
        if (!amount || amount <= 0) {
          return { valid: false, message: "Please enter a valid amount" };
        }
        
        const requiredGold = amount / currentGoldRate;
        if (requiredGold > availableGold) {
          return {
            valid: false,
            message: `Insufficient gold. You need ${requiredGold.toFixed(4)}g but only have ${availableGold}g`
          };
        }
        
        return {
          valid: true,
          message: `Will require ${requiredGold.toFixed(4)}g of gold`,
          requiredGold
        };
      } else if (type === 'physical' || type === 'jewellery') {
        if (!grams || grams <= 0) {
          return { valid: false, message: "Please enter valid gold grams" };
        }
        
        if (parseFloat(grams) > availableGold) {
          return {
            valid: false,
            message: `Insufficient gold. You only have ${availableGold}g`
          };
        }
        
        const estimatedValue = grams * currentGoldRate;
        return {
          valid: true,
          message: `Estimated value: ₹${estimatedValue.toLocaleString('en-IN')}`,
          estimatedValue
        };
      }
      
      return { valid: false, message: "Invalid withdrawal type" };
    } catch (error) {
      return { valid: false, message: "Validation error: " + error.message };
    }
  }
}

export default new WithdrawalsService();