"use client";
import { useState, useEffect } from "react";
import {
    Bell,
    Settings,
    MessageSquare,
    Mail,
    Smartphone,
    Check,
    AlertCircle,
    Loader2,
    Clock
} from "lucide-react";
import NotificationService from "@/services/notification/notification.service";
import Toast from "@/components/Toast";
import { useUser } from "@/context/UserContext";

export default function CustomerNotificationsPage() {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [toast, setToast] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Settings State (Mock for now, would ideally connect to a user preference API)
    const [preferences, setPreferences] = useState({
        email: true,
        sms: true,
        whatsapp: false,
        push: true
    });

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const fetchNotifications = async (page = 1) => {
        try {
            setLoading(true);
            const response = await NotificationService.getAllNotifications(page, pagination.limit);

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
            await NotificationService.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n._id === id || n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setToast({ message: "All notifications marked as read", type: "success" });
        } catch (error) {
            setToast({ message: "Failed to mark all as read", type: "error" });
        }
    };

    const togglePreference = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
        // Ideally call API to save preference here
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
        switch (type) {
            case 'Deposit': return <div className="p-2 rounded-full bg-green-100 text-green-600"><Clock size={18} /></div>;
            case 'Withdrawal': return <div className="p-2 rounded-full bg-red-100 text-red-600"><Clock size={18} /></div>;
            case 'KYC': return <div className="p-2 rounded-full bg-blue-100 text-blue-600"><Check size={18} /></div>;
            default: return <div className="p-2 rounded-full bg-gray-100 text-gray-600"><Bell size={18} /></div>;
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
                    <p className="text-sm text-muted-foreground mt-1">Stay updated with your latest activities.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        <Settings size={16} />
                        <span>Preferences</span>
                    </button>
                    <button
                        onClick={handleMarkAllRead}
                        className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Mark all read
                    </button>
                </div>
            </div>

            {isSettingsOpen && (
                <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm animate-in slide-in-from-top-2">
                    <h3 className="font-semibold mb-4">Notification Preferences</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/20">
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-muted-foreground" />
                                <span className="text-sm font-medium">Email</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.email}
                                onChange={() => togglePreference('email')}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/20">
                            <div className="flex items-center gap-3">
                                <Smartphone size={18} className="text-muted-foreground" />
                                <span className="text-sm font-medium">SMS</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.sms}
                                onChange={() => togglePreference('sms')}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/20">
                            <div className="flex items-center gap-3">
                                <MessageSquare size={18} className="text-muted-foreground" />
                                <span className="text-sm font-medium">WhatsApp</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.whatsapp}
                                onChange={() => togglePreference('whatsapp')}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/20">
                            <div className="flex items-center gap-3">
                                <Bell size={18} className="text-muted-foreground" />
                                <span className="text-sm font-medium">Push</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.push}
                                onChange={() => togglePreference('push')}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading notifications...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-xl border border-dashed border-border">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No notifications yet</h3>
                    <p className="text-muted-foreground text-center max-w-sm mt-2">
                        You're all caught up! New notifications will appear here when there's activity on your account.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id || notif.id}
                            className={`group flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${notif.isRead
                                    ? 'bg-card border-border'
                                    : 'bg-primary/5 border-primary/20 shadow-sm'
                                }`}
                        >
                            <div className="shrink-0 mt-1">
                                {getIconForType(notif.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className={`text-base font-semibold ${!notif.isRead ? 'text-primary' : 'text-foreground'}`}>
                                        {notif.title}
                                    </h4>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {getTimeAgo(notif.createdAt || notif.time)}
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                    {notif.message || notif.description}
                                </p>

                                {!notif.isRead && (
                                    <button
                                        onClick={() => handleMarkAsRead(notif._id || notif.id)}
                                        className="text-xs font-medium text-primary mt-3 hover:underline flex items-center gap-1"
                                    >
                                        <Check size={12} /> Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

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
