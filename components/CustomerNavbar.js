"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import NotificationService from "@/services/notification/notification.service";
import {
  Sun,
  Moon,
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  ArrowRightLeft,
  CheckCircle2
} from "lucide-react";

// ... (existing helper components)

export default function CustomerNavbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const router = useRouter();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ... (recentActivity state remains if needed, but it seems dummy. The user asked to implement notifications. I will likely leave recentActivity as is or mostly untouched unless it conflicts)
  const [recentActivity] = useState([
    { id: "TXN-8005", type: "Deposit", date: "30 Nov, 09:00 AM", rate: 7550, amount: 50000, goldImpact: 6.64 },
    { id: "TXN-8004", type: "Withdrawal", date: "28 Nov, 03:30 PM", rate: 7520, amount: 25000, goldImpact: -3.32 },
  ]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await NotificationService.getAllNotifications(1, 20);
      // Assuming response structure: { success: true, data: { notifications: [], ... } } or just data array
      // Adjusting based on common patterns in this project (e.g. response.data.notifications or response.data)
      const notifs = response.data?.notifications || response.data || [];
      if (Array.isArray(notifs)) {
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Optional: Poll every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await NotificationService.markAsRead(notif.id);
        const updatedNotifs = notifications.map(n =>
          n.id === notif.id ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifs);
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
  };

  // Helper to get formatted time (simple relative time)
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h ago`;
    return `${Math.floor(diffInSeconds / 86400)} d ago`;
  };

  // ... (useEffect for click outside remains the same)

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ... (handleLogout, handleProfileClick remain)

  // getTypeBadge function (unchanged)

  return (
    <nav className="h-14 md:h-16 border-b border-border bg-background px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">

      {/* Left Side: Mobile Menu + Search Bar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-muted/50 rounded-md border border-input focus-within:ring-2 focus-within:ring-ring transition-all">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="bg-transparent border-none outline-none text-sm w-32 sm:w-48 md:w-64 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right Side: Icons & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">

        {/* --- Notification Bell --- */}
        <div className="relative" ref={notifRef}>
          {/* Mobile Backdrop */}
          {isNotifOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsNotifOpen(false)}
              aria-hidden="true"
            />
          )}

          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors relative outline-none"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[90vw] sm:w-80 md:w-96 max-w-[90vw] sm:max-w-md h-auto max-h-[70vh] sm:max-h-[600px] bg-card text-card-foreground border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50 flex flex-col">
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-border flex justify-between items-center shrink-0">
                <h3 className="font-semibold text-sm sm:text-base">Notifications ({unreadCount})</h3>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs sm:text-sm text-primary hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto max-h-[300px] sm:max-h-[400px] md:max-h-[450px]">
                {notifications.length === 0 ? (
                  <div className="p-4 sm:p-5 md:p-6 text-center text-xs sm:text-sm text-muted-foreground">No new notifications</div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {notifications.map((notif) => {
                      // Determine dot color based on type or fallback
                      let dotColor = 'bg-primary';
                      if (notif.type === 'Deposit') dotColor = 'bg-green-500';
                      if (notif.type === 'KYC') dotColor = 'bg-red-500';

                      return (
                        <div
                          key={notif.id}
                          className={`p-2.5 sm:p-3 md:p-3.5 hover:bg-muted/50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-muted/20' : ''}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="flex items-start gap-2 sm:gap-2.5">
                            {/* Colored Status Dot */}
                            {!notif.isRead && (
                              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${dotColor} rounded-full shrink-0 mt-1 sm:mt-1.5`}></div>
                            )}

                            {/* Notification Content */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs sm:text-sm md:text-base font-semibold text-foreground mb-0.5 sm:mb-1 ${!notif.isRead ? 'font-bold' : 'font-medium'}`}>
                                {notif.title}
                              </p>
                              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-0.5 sm:mb-1 wrap-break-word">
                                {notif.message || notif.description}
                              </p>
                              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                                {getTimeAgo(notif.createdAt || notif.time)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* View All Activity Button */}
              <div className="p-2 sm:p-2 border-t border-border text-center shrink-0">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    router.push("/customers/notifications");
                  }}
                  className="text-xs sm:text-sm md:text-base font-medium text-primary hover:underline"
                >
                  View All Activity
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors">
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* --- User Profile --- */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all outline-none"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-card text-card-foreground border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-semibold">{user?.name || "Customer"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "customer@example.com"}</p>
                <p className="text-xs text-muted-foreground mt-1">Customer</p>
              </div>
              <div className="p-1">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <User size={16} /> My Profile
                </button>
              </div>
              <div className="p-1 border-t border-border">
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 transition-colors text-left font-medium">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

