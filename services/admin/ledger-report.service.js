// services/admin/ledger-reports.service.js
import API from "@/lib/api";

class LedgerReportsService {
    // Get ledger data with filters
    async getLedgerData(params = {}) {
        try {
            const response = await API.get('/admin/ledger-reports/ledger', { params });
            return response.data;
        } catch (error) {
            console.error('Get ledger data error:', error);
            throw error;
        }
    }

    // Export ledger data
    async exportLedger(data) {
        try {
            const response = await API.post('/admin/ledger-reports/ledger/export', data);
            return response.data;
        } catch (error) {
            console.error('Export ledger error:', error);
            throw error;
        }
    }

    // Get transaction summary
    async getTransactionSummary(period = 'today') {
        try {
            const response = await API.get('/admin/ledger-reports/ledger/summary', {
                params: { period }
            });
            return response.data;
        } catch (error) {
            console.error('Get transaction summary error:', error);
            throw error;
        }
    }

    // Get report types
    async getReportTypes() {
        try {
            const response = await API.get('/admin/ledger-reports/reports/types');
            return response.data;
        } catch (error) {
            console.error('Get report types error:', error);
            throw error;
        }
    }

    // Generate report
    async generateReport(reportId, data = {}) {
        try {
            const response = await API.post(`/admin/ledger-reports/reports/generate/${reportId}`, data);
            return response.data;
        } catch (error) {
            console.error('Generate report error:', error);
            throw error;
        }
    }

    // Get recent reports
    async getRecentReports(limit = 10) {
        try {
            const response = await API.get('/admin/ledger-reports/reports/recent', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Get recent reports error:', error);
            throw error;
        }
    }

    // Get report statistics
    async getReportStatistics(reportId, params = {}) {
        try {
            const response = await API.get(`/admin/ledger-reports/reports/statistics/${reportId}`, {
                params
            });
            return response.data;
        } catch (error) {
            console.error('Get report statistics error:', error);
            throw error;
        }
    }

    // Download report
    async downloadReport(reportId, format = 'pdf') {
        try {
            const response = await API.get(`/admin/ledger-reports/reports/download/${reportId}/${format}`, {
                responseType: 'blob' // Important for file downloads
            });
            return response;
        } catch (error) {
            console.error('Download report error:', error);
            throw error;
        }
    }

    // Download exported ledger file
    async downloadExportedLedger(data, format = 'excel') {
        try {
            const response = await API.post('/admin/ledger-reports/ledger/export', data, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ledger-export-${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            return true;
        } catch (error) {
            console.error('Download exported ledger error:', error);
            throw error;
        }
    }
}

export default new LedgerReportsService();