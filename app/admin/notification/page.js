"use client";
import { useState, useEffect } from "react";
import {
    Bell,
    Check,
    Loader2,
    Clock,
    User,
    FileText,
    ShieldAlert
} from "lucide-react";
import NotificationService from "@/services/notification/notification.service";
import Toast from "@/components/Toast";
import { useUser } from "@/context/UserContext";

export default function AdminNotificationsPage() {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [toast, setToast] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const fetchNotifications = async (page = 1) => {
        try {
            setLoading(true);
            const response = await NotificationService.getAdminNotifications(page, pagination.limit);

            const notifs = response.data?.notifications || response.data || [];
            const total = response.data?.total || notifs.length;
            const totalPages = response.data?.totalPages || Math.ceil(total / pagination.limit);

            setNotifications(notifs);
            setPagination(prev => ({ ...prev, page, total, totalPages }));
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            setToast({ message: "Failed to load notifications", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await NotificationService.markAdminNotificationAsRead(id);
            setNotifications(prev => prev.map(n =>
                n._id === id || n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await NotificationService.markAllAdminNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setToast({ message: "All notifications marked as read", type: "success" });
        } catch (error) {
            setToast({ message: "Failed to mark all as read", type: "error" });
        }
    };

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const getIconForType = (type) => {
        // Admin specific types + common ones
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('deposit')) return <div className="p-2 rounded-full bg-green-100 text-green-600"><Clock size={18} /></div>;
        if (lowerType.includes('withdrawal')) return <div className="p-2 rounded-full bg-red-100 text-red-600"><Clock size={18} /></div>;
        if (lowerType.includes('kyc')) return <div className="p-2 rounded-full bg-blue-100 text-blue-600"><User size={18} /></div>;
        if (lowerType.includes('system') || lowerType.includes('alert')) return <div className="p-2 rounded-full bg-yellow-100 text-yellow-600"><ShieldAlert size={18} /></div>;
        if (lowerType.includes('report')) return <div className="p-2 rounded-full bg-purple-100 text-purple-600"><FileText size={18} /></div>;

        return <div className="p-2 rounded-full bg-gray-100 text-gray-600"><Bell size={18} /></div>;
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Notifications</h1>
                    <p className="text-sm text-muted-foreground mt-1">Updates on system activity, requests, and alerts.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => fetchNotifications(pagination.page)}
                        className="flex-1 sm:flex-none px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleMarkAllRead}
                        className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Mark all read
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading admin notifications...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-muted/10 rounded-xl border border-dashed border-border">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No notifications</h3>
                    <p className="text-muted-foreground text-center max-w-sm mt-2">
                        There are no new updates or alerts for you at the moment.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="divide-y divide-border">
                            {notifications.map((notif) => (
                                <div
                                    key={notif._id || notif.id}
                                    className={`group flex items-start gap-4 p-4 sm:p-5 transition-all hover:bg-muted/30 ${!notif.isRead ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="shrink-0 mt-1">
                                        {getIconForType(notif.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                                            <h4 className={`text-base font-semibold ${!notif.isRead ? 'text-primary' : 'text-foreground'}`}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 flex items-center gap-1">
                                                <Clock size={12} />
                                                {getTimeAgo(notif.createdAt || notif.time)}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed break-words">
                                            {notif.message || notif.description}
                                        </p>

                                        <div className="flex items-center gap-4 mt-3">
                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif._id || notif.id)}
                                                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <Check size={12} /> Mark as read
                                                </button>
                                            )}

                                            {/* Contextual Action (Example) */}
                                            {(notif.type?.toLowerCase() === 'kyc') && (
                                                <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                                    View KYC Request
                                                </button>
                                            )}
                                            {(notif.type?.toLowerCase() === 'deposit') && (
                                                <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                                    View Deposit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => fetchNotifications(pagination.page - 1)}
                                className="px-3 py-1 text-sm border border-input rounded hover:bg-muted disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-muted-foreground flex items-center">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => fetchNotifications(pagination.page + 1)}
                                className="px-3 py-1 text-sm border border-input rounded hover:bg-muted disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
