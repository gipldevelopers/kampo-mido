// services/notification/notification.service.js

import API from "@/lib/api";

class NotificationService {
    // Get all customer notifications with pagination
    async getAllNotifications(page = 1, limit = 20) {
        try {
            const response = await API.get("/notifications", {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching customer notifications:", error);
            throw error;
        }
    }

    // Mark a specific customer notification as read
    async markAsRead(notificationId) {
        try {
            const response = await API.patch(`/notifications/${notificationId}/read`, {});
            return response.data;
        } catch (error) {
            console.error(`Error marking notification ${notificationId} as read:`, error);
            throw error;
        }
    }

    // Mark all customer notifications as read
    async markAllAsRead() {
        try {
            const response = await API.patch("/notifications/read-all", {});
            return response.data;
        } catch (error) {
            console.error("Error marking all customer notifications as read:", error);
            throw error;
        }
    }

    // --- Admin Notification Methods ---

    // Get all admin notifications
    async getAdminNotifications(page = 1, limit = 20) {
        try {
            const response = await API.get("/admin/notifications", {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching admin notifications:", error);
            throw error;
        }
    }

    // Mark specific admin notification as read
    async markAdminNotificationAsRead(notificationId) {
        try {
            const response = await API.patch(`/admin/notifications/${notificationId}/read`, {});
            return response.data;
        } catch (error) {
            console.error(`Error marking admin notification ${notificationId} as read:`, error);
            throw error;
        }
    }

    // Mark all admin notifications as read
    async markAllAdminNotificationsAsRead() {
        try {
            const response = await API.patch("/admin/notifications/read-all", {});
            return response.data;
        } catch (error) {
            console.error("Error marking all admin notifications as read:", error);
            throw error;
        }
    }
}

export default new NotificationService();
