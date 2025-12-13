// services/admin/gold-rate.service.js

import API from "@/lib/api";

class GoldRateService {
  // Get current gold rate
  async getCurrentRate() {
    try {
      const response = await API.get("/admin/gold-rate/current");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get gold rate history
  async getHistory() {
    try {
      const response = await API.get("/admin/gold-rate/history");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update gold rate
  async updateRate(rateData) {
    try {
      const payload = {
        ratePerGram: rateData.ratePerGram,
        effectiveDate: rateData.effectiveDate,
      };
      
      // Add notes only if provided
      if (rateData.notes && rateData.notes.trim()) {
        payload.notes = rateData.notes.trim();
      }
      
      const response = await API.post("/admin/gold-rate/update", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new GoldRateService();

