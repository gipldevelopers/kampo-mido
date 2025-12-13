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
      const response = await API.get(`/admin/kyc/view/${kycId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update KYC status (approve/reject)
  async updateKYCStatus(kycId, status, notes = "", documentsToReupload = null) {
    try {
      const payload = {
        status,
        notes,
      };
      
      // Add documentsToReupload if provided (for reject with specific documents)
      if (documentsToReupload && Array.isArray(documentsToReupload) && documentsToReupload.length > 0) {
        payload.documentsToReupload = documentsToReupload;
      }
      
      const response = await API.put(`/admin/kyc/update-status/${kycId}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Request re-upload
  async requestReupload(kycId, documentsToReupload = [], notes = "") {
    try {
      const payload = {};
      
      // Add documentsToReupload if provided
      if (documentsToReupload && Array.isArray(documentsToReupload) && documentsToReupload.length > 0) {
        payload.documentsToReupload = documentsToReupload;
      }
      
      // Add notes if provided
      if (notes) {
        payload.notes = notes;
      }
      
      const response = await API.post(`/admin/kyc/request-reupload/${kycId}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AdminKYCService();

