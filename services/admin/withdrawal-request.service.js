// services/admin/withdrawal-request.service.js

import API from "@/lib/api";

class WithdrawalRequestService {
    // Get all withdrawal requests with filters
    async getWithdrawalRequests(params) {
        try {
            const queryParams = new URLSearchParams();

            // Add pagination
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            // Add filters
            if (params.search && params.search.trim()) {
                queryParams.append('search', params.search.trim());
            }

            if (params.status && params.status !== 'All') {
                queryParams.append('status', params.status.toLowerCase());
            }

            if (params.type && params.type !== 'All') {
                queryParams.append('type', params.type.toLowerCase());
            }

            const queryString = queryParams.toString();
            const url = `/admin/withdrawals/get-all-requests${queryString ? `?${queryString}` : ''}`;

            const response = await API.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get withdrawal by ID
    async getWithdrawalById(id) {
        try {
            const response = await API.get(`/admin/withdrawals/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update withdrawal status (approve/reject)
    async updateWithdrawalStatus(id, statusData) {
        try {
            const payload = {
                status: statusData.status,
            };

            // Add grams if provided (important for money withdrawals)
            if (statusData.grams !== undefined) {
                payload.grams = statusData.grams;
            }

            // Add admin notes only if provided
            if (statusData.adminNotes && statusData.adminNotes.trim()) {
                payload.adminNotes = statusData.adminNotes.trim();
            }

            const response = await API.put(`/admin/withdrawals/${id}/status`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Mark withdrawal as completed
    async completeWithdrawal(id, completionData) {
        try {
            const payload = {};

            // Add notes only if provided
            if (completionData.notes && completionData.notes.trim()) {
                payload.notes = completionData.notes.trim();
            }

            const response = await API.post(`/admin/withdrawals/${id}/complete`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Add admin notes to withdrawal
    async addAdminNotes(id, notesData) {
        try {
            const payload = {
                notes: notesData.notes.trim()
            };

            const response = await API.post(`/admin/withdrawals/${id}/notes`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Export withdrawals (PDF/Excel)
    async exportWithdrawals(params) {
        try {
            const queryParams = new URLSearchParams();

            // Add format
            queryParams.append('format', params.format || 'pdf');

            // Add filters
            if (params.status && params.status !== 'All') {
                queryParams.append('status', params.status.toLowerCase());
            }

            if (params.type && params.type !== 'All') {
                queryParams.append('type', params.type.toLowerCase());
            }

            if (params.startDate) {
                queryParams.append('startDate', params.startDate);
            }

            if (params.endDate) {
                queryParams.append('endDate', params.endDate);
            }

            const queryString = queryParams.toString();
            const url = `/admin/withdrawals/export${queryString ? `?${queryString}` : ''}`;

            // For file downloads, we need to handle blob response
            const response = await API.get(url, {
                responseType: 'blob'
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get withdrawal statistics
    async getWithdrawalStats() {
        try {
            const response = await API.get('/admin/withdrawals/stats');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get withdrawal summary for dashboard
    async getWithdrawalSummary() {
        try {
            const response = await API.get('/admin/withdrawals/summary');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new WithdrawalRequestService();