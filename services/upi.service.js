// services/admin/upi.service.js
import API from "@/lib/api";

class UPIService {
  // Get current UPI settings (admin)
  async getUPISettings() {
    try {
      const response = await API.get("/upi-setting/admin/upi");
      return response.data;
    } catch (error) {
      console.error('Get UPI settings error:', error);
      throw error;
    }
  }

  // Update UPI ID (admin)
  async updateUPI(upiData) {
    try {
      const response = await API.put("/upi-setting/admin/upi", upiData);
      return response.data;
    } catch (error) {
      console.error('Update UPI error:', error);
      throw error;
    }
  }

  // Get UPI QR code (customer) - if needed elsewhere
  async getUPIQR() {
    try {
      const response = await API.get("/upi-setting/customer/upi-qr");
      return response.data;
    } catch (error) {
      console.error('Get UPI QR error:', error);
      throw error;
    }
  }
}

export default new UPIService();