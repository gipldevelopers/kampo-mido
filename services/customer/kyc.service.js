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
}

export default new KYCService();

