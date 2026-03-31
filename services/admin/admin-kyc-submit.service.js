// services/admin/admin-kyc-submit.service.js
import API from "@/lib/api";

class AdminKYCSubmitService {
  /**
   * Submit KYC documents for a customer from Admin/Staff side
   * @param {string|number} customerId 
   * @param {Object} kycData 
   */
  async submitCustomerKYC(customerId, kycData) {
    try {
      const formData = new FormData();
      formData.append("customerId", customerId);

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

      // Append Nominee Details
      if (kycData.nomineeName) formData.append("nomineeName", kycData.nomineeName);
      if (kycData.nomineeRelation) formData.append("nomineeRelation", kycData.nomineeRelation);
      if (kycData.nomineeDob) formData.append("nomineeDob", kycData.nomineeDob);
      if (kycData.nomineeAddress) formData.append("nomineeAddress", kycData.nomineeAddress);
      if (kycData.nomineePhone) formData.append("nomineePhone", kycData.nomineePhone);

      const response = await API.post(`/admin/kyc/submit-for-customer/${customerId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get KYC status for a customer (Admin side)
   */
  async getCustomerKYCStatus(customerId) {
    try {
      const response = await API.get(`/admin/kyc/view/${customerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AdminKYCSubmitService();
