import axios from "axios";
import AuthService from "../auth.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const getAuthHeader = () => {
    const token = AuthService.getStoredToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const NotificationService = {
    // Get all notifications with pagination
    getAllNotifications: async (page = 1, limit = 20) => {
        try {
            const response = await axios.get(
                `${API_URL}/notifications`,
                {
                    params: { page, limit },
                    ...getAuthHeader()
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            throw error;
        }
    },

    // Mark a specific notification as read
    markAsRead: async (notificationId) => {
        try {
            const response = await axios.patch(
                `${API_URL}/notifications/${notificationId}/read`,
                {},
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Error marking notification ${notificationId} as read:`, error);
            throw error;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const response = await axios.patch(
                `${API_URL}/notifications/read-all`,
                {},
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            throw error;
        }
    },

    // --- Admin Notification Methods ---

    // Get all admin notifications
    getAdminNotifications: async (page = 1, limit = 20) => {
        try {
            const response = await axios.get(
                `${API_URL}/admin/notifications`,
                {
                    params: { page, limit },
                    ...getAuthHeader()
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching admin notifications:", error);
            throw error;
        }
    },

    // Mark specific admin notification as read
    markAdminNotificationAsRead: async (notificationId) => {
        try {
            const response = await axios.patch(
                `${API_URL}/admin/notifications/${notificationId}/read`,
                {},
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error(`Error marking admin notification ${notificationId} as read:`, error);
            throw error;
        }
    },

    // Mark all admin notifications as read
    markAllAdminNotificationsAsRead: async () => {
        try {
            const response = await axios.patch(
                `${API_URL}/admin/notifications/read-all`,
                {},
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            console.error("Error marking all admin notifications as read:", error);
            throw error;
        }
    }
};

export default NotificationService;
