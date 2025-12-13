// services/admin/admin-kyc.service.js

import API from "@/lib/api";

class AdminKYCService {
  // Get all KYC requests
  async getAllKYC(params = {}) {
    try {
      const { status, page = 1, limit = 50 } = params;
      const queryParams = new URLSearchParams();
      if (status) queryParams.append("status", status);
      queryParams.append("page", page);
      queryParams.append("limit", limit);

      const response = await API.get(`/admin/kyc/get-all?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get KYC by ID
  async getKYCById(kycId) {
    try {
      // Ensure kycId is a valid number or string
      if (!kycId || kycId === "N/A" || kycId === "null") {
        throw new Error("Invalid KYC ID");
      }
      
      // Convert to string and extract numeric part if formatted (e.g., "KYC-1" -> "1")
      let finalKycId = String(kycId);
      if (!/^\d+$/.test(finalKycId)) {
        const numericMatch = finalKycId.match(/\d+/);
        if (numericMatch) {
          finalKycId = numericMatch[0];
        } else {
          throw new Error("Invalid KYC ID format");
        }
      }
      
      console.log("Fetching KYC by ID:", finalKycId);
      const response = await API.get(`/admin/kyc/view/${finalKycId}`);
      return response.data;
    } catch (error) {
      console.error("Get KYC by ID Error:", error);
      throw error;
    }
  }

  // Update KYC status (approve/reject)
  async updateKYCStatus(kycId, status, notes = "", documentsToReupload = null) {
    try {
      // Ensure kycId is a valid number or string
      if (!kycId || kycId === "N/A" || kycId === "null") {
        throw new Error("Invalid KYC ID");
      }
      
      // Convert to string and extract numeric part if formatted (e.g., "KYC-1" -> "1")
      let finalKycId = String(kycId);
      if (!/^\d+$/.test(finalKycId)) {
        const numericMatch = finalKycId.match(/\d+/);
        if (numericMatch) {
          finalKycId = numericMatch[0];
        } else {
          throw new Error("Invalid KYC ID format");
        }
      }
      
      const payload = {
        status,
        notes: notes || "",
      };
      
      // Add documentsToReupload if provided (for reject with specific documents)
      if (documentsToReupload && Array.isArray(documentsToReupload) && documentsToReupload.length > 0) {
        payload.documentsToReupload = documentsToReupload;
      }
      
      console.log("Updating KYC status:", { kycId: finalKycId, status, notes });
      const response = await API.put(`/admin/kyc/update-status/${finalKycId}`, payload);
      return response.data;
    } catch (error) {
      console.error("Update KYC Status Error:", error);
      throw error;
    }
  }

  // Request re-upload
  async requestReupload(kycId, documentsToReupload = [], notes = "") {
    try {
      // Ensure kycId is a valid number or string
      if (!kycId || kycId === "N/A" || kycId === "null") {
        throw new Error("Invalid KYC ID");
      }
      
      // Convert to string and extract numeric part if formatted (e.g., "KYC-1" -> "1")
      let finalKycId = String(kycId);
      if (!/^\d+$/.test(finalKycId)) {
        const numericMatch = finalKycId.match(/\d+/);
        if (numericMatch) {
          finalKycId = numericMatch[0];
        } else {
          throw new Error("Invalid KYC ID format");
        }
      }
      
      const payload = {};
      
      // Add documentsToReupload if provided
      if (documentsToReupload && Array.isArray(documentsToReupload) && documentsToReupload.length > 0) {
        payload.documentsToReupload = documentsToReupload;
      }
      
      // Add notes if provided
      if (notes) {
        payload.notes = notes;
      }
      
      console.log("Requesting re-upload:", { kycId: finalKycId, documentsToReupload, notes });
      const response = await API.post(`/admin/kyc/request-reupload/${finalKycId}`, payload);
      return response.data;
    } catch (error) {
      console.error("Request Re-upload Error:", error);
      throw error;
    }
  }
}

export default new AdminKYCService();

