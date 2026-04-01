// services/admin/cap-system.service.js
import API from "@/lib/api";

class CapSystemService {
    /**
     * Get all emergency cap bypass requests
     */
    async getAllEmergencyRequests() {
        try {
            const response = await API.get('/admin/cap-system/emergency-requests');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get emergency request by ID
     * @param {number|string} id 
     */
    async getEmergencyRequestById(id) {
        try {
            const response = await API.get(`/admin/cap-system/emergency-requests/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update emergency request status (approve/reject)
     * @param {number|string} id 
     * @param {object} statusData { status, adminNotes }
     */
    async updateRequestStatus(id, statusData) {
        try {
            const response = await API.post(`/admin/cap-system/emergency-requests/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new CapSystemService();
