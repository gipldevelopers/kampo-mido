// services/admin/audit-log.service.js

import API from "@/lib/api";

class AuditLogService {
  /**
   * Get all audit logs with filters
   * @param {Object} params - Query parameters (userId, action, resource, startDate, endDate, page, limit)
   */
  async getAuditLogs(params = {}) {
    try {
      const response = await API.get("/audit-logs", {
        params
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get audit log by ID
   * @param {number|string} id - Audit log ID
   */
  async getAuditLogById(id) {
    try {
      const response = await API.get(`/audit-logs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuditLogService();
