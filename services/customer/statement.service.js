// services/customer/statements.service.js
import API from "@/lib/api";

class StatementsService {
    // Get all statements
    async getStatements(page = 1, limit = 10, type = null, year = null, month = null) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });

            if (type && type !== 'all') {
                params.append("type", type);
            }

            if (year) {
                params.append("year", year);
            }

            if (month) {
                params.append("month", month);
            }

            const response = await API.get(`/customer/statements?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get statement by ID
    async getStatementById(id) {
        try {
            const response = await API.get(`/customer/statements/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Download statement
    async downloadStatement(id, format = 'pdf') {
        try {
            const response = await API.get(`/customer/statements/${id}/download?format=${format}`, {
                responseType: 'blob'
            });

            // Create blob and download link
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from content-disposition header
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'statement.pdf';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
                if (fileNameMatch && fileNameMatch.length === 2) {
                    fileName = fileNameMatch[1];
                }
            }

            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return { success: true, fileName };
        } catch (error) {
            throw error;
        }
    }

    // Get statement summary
    async getStatementSummary() {
        try {
            const response = await API.get('/customer/statements/summary');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Generate statement
    async generateStatement(periodStart, periodEnd, type = 'weekly') {
        try {
            const response = await API.post('/customer/statements/generate', {
                periodStart,
                periodEnd,
                type
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new StatementsService();