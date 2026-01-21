// services/customer/kyc.service.js

import API from "@/lib/api";

class KYCService {
  // Upload KYC documents
  async uploadKYC(kycData) {
    try {
      const formData = new FormData();

      // Append files
      if (kycData.aadhaarFront) {
        formData.append("aadhaarFront", kycData.aadhaarFront);
      }
      if (kycData.aadhaarBack) {
        formData.append("aadhaarBack", kycData.aadhaarBack);
      }
      if (kycData.panCard) {
        formData.append("panCard", kycData.panCard);
      }
      if (kycData.selfie) {
        formData.append("selfie", kycData.selfie);
      }

      // Append text fields
      if (kycData.idType) {
        formData.append("idType", kycData.idType);
      }
      if (kycData.idNumber) {
        formData.append("idNumber", kycData.idNumber);
      }
      if (kycData.panNumber) {
        formData.append("panNumber", kycData.panNumber);
      }
      // Append Bank Details
      if (kycData.bankName) formData.append("bankName", kycData.bankName);
      if (kycData.accountNumber) formData.append("accountNumber", kycData.accountNumber);
      if (kycData.ifscCode) formData.append("ifscCode", kycData.ifscCode);
      if (kycData.accountHolder) formData.append("accountHolder", kycData.accountHolder);

      const response = await API.post("/customer/kyc/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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
}

export default new KYCService();

