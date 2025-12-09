"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  ArrowRightLeft,
  CheckCircle2
} from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, customer: "John Doe", action: "deposited", amount: 50000, time: "2 min ago", type: "Deposit", goldImpact: -5.5 },
    { id: 2, customer: "KYC verification", action: "request", time: "1 hour ago", type: "KYC", goldImpact: 1.32, status: "Pending" },
    { id: 3, action: "Rate updated to ₹7,645", time: "5s ago", type: "Revaluation" },
  ]);

  const [recentActivity] = useState([
    { id: "TXN-8005", customer: "System", date: "30 Nov, 09:00 AM", rate: 7550, amount: null, goldImpact: null, type: "Revaluation" },
    { id: "TXN-8006", customer: "Sneha Gupta", date: "29 Nov, 02:15 PM", rate: 7520, amount: 50000, goldImpact: 6.64, type: "Conversion" },
  ]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

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

  const isAdminPage = pathname.startsWith("/admin");
  const isCustomerPage = pathname.startsWith("/customers");
  
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleProfileClick = () => {
    if (isAdminPage) {
      router.push("/admin/profile");
    } else if (isCustomerPage) {
      router.push("/customers/profile-page");
    }
  };

  const getTypeBadge = (type) => {
    let icon = null;
    let text = "";
    let bgColor = "";
    let textColor = "";
    
    if (type === "Deposit") {
      icon = <ArrowDownLeft size={12} className="sm:w-3 sm:h-3" />;
      text = "Deposit";
      bgColor = "bg-green-500/10";
      textColor = "text-green-600";
    } else if (type === "Withdrawal") {
      icon = <ArrowUpRight size={12} className="sm:w-3 sm:h-3" />;
      text = "Withdrawal";
      bgColor = "bg-destructive/10";
      textColor = "text-destructive";
    } else if (type === "Revaluation") {
      icon = <RefreshCcw size={12} className="sm:w-3 sm:h-3" />;
      text = "Revaluation";
      bgColor = "bg-primary/10";
      textColor = "text-primary";
    } else if (type === "Conversion") {
      icon = <ArrowRightLeft size={12} className="sm:w-3 sm:h-3" />;
      text = "Conversion";
      bgColor = "bg-blue-500/10";
      textColor = "text-blue-600";
    } else if (type === "KYC") {
      icon = <CheckCircle2 size={12} className="sm:w-3 sm:h-3" />;
      text = "KYC";
      bgColor = "bg-secondary";
      textColor = "text-secondary-foreground";
    }
    
    return { icon, text, bgColor, textColor };
  };

  return (
    // Changed bg-background/95 backdrop-blur -> bg-background
    // This removes the blur and transparency, making it solid and synced with theme
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
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm w-32 sm:w-48 md:w-64 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right Side: Icons & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        
        {/* --- Notification Bell --- */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors relative outline-none"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="fixed sm:absolute right-0 sm:right-0 top-14 sm:top-auto sm:mt-2 w-full sm:w-[calc(100vw-2rem)] md:w-96 max-w-full sm:max-w-md h-[calc(100vh-3.5rem)] sm:h-auto sm:max-h-[600px] bg-card text-card-foreground border-r sm:border border-border sm:rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50 flex flex-col">
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-border flex justify-between items-center shrink-0">
                <h3 className="font-semibold text-sm sm:text-base">Notifications</h3>
                <button 
                  onClick={() => setNotifications([])} 
                  className="text-xs sm:text-sm text-primary hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>
              
              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 sm:p-6 text-center text-xs sm:text-sm text-muted-foreground">No new notifications</div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {notifications.map((notif) => {
                      const badge = getTypeBadge(notif.type);
                      const isPositive = notif.goldImpact && notif.goldImpact > 0;
                      const isNegative = notif.goldImpact && notif.goldImpact < 0;
                      
                      return (
                        <div key={notif.id} className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              {notif.customer ? (
                                <p className="text-xs sm:text-sm font-medium text-foreground break-words">
                                  {notif.customer} {notif.action} {notif.amount ? `₹${notif.amount.toLocaleString()}` : ""}
                                </p>
                              ) : (
                                <p className="text-xs sm:text-sm font-medium text-foreground break-words">
                                  {notif.action}
                                </p>
                              )}
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{notif.time}</p>
                            </div>
                            {badge.text && (
                              <button className={`flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border shrink-0 ${badge.bgColor} ${badge.textColor} border-current/20`}>
                                {badge.icon}
                                <span>{badge.text}</span>
                              </button>
                            )}
                          </div>
                          {notif.goldImpact !== null && notif.goldImpact !== undefined && (
                            <div className="flex items-center justify-end mt-1.5 sm:mt-2">
                              <p className={`text-xs sm:text-sm font-bold ${
                                isPositive ? 'text-green-600' : isNegative ? 'text-blue-600' : 'text-muted-foreground'
                              }`}>
                                Gold Impact {isPositive ? '+' : ''}{notif.goldImpact} g
                              </p>
                            </div>
                          )}
                          {notif.status && (
                            <div className="flex items-center justify-end mt-1.5 sm:mt-2">
                              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] bg-secondary text-secondary-foreground border border-secondary">
                                {notif.status}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* View All Activity Button */}
              <div className="p-2 sm:p-3 border-t border-border text-center shrink-0">
                <button className="text-xs sm:text-sm font-medium text-primary hover:underline">
                  View All Activity
                </button>
              </div>

              {/* Recent Activity Section */}
              <div className="border-t border-border shrink-0">
                <div className="p-3 sm:p-4 border-b border-border/50">
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">Recent Activity</h4>
                </div>
                <div className="max-h-[200px] sm:max-h-[250px] overflow-y-auto">
                  {recentActivity.map((activity) => {
                    const badge = getTypeBadge(activity.type);
                    const isPositive = activity.goldImpact && activity.goldImpact > 0;
                    
                    return (
                      <div key={activity.id} className="p-3 sm:p-4 border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-medium text-foreground truncate">{activity.id}</p>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{activity.customer}</p>
                          </div>
                          {badge.text && (
                            <button className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-medium border shrink-0 ${badge.bgColor} ${badge.textColor} border-current/20`}>
                              {badge.icon}
                              <span>{badge.text}</span>
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-[9px] sm:text-[10px]">
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="text-foreground truncate">{activity.date}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rate</p>
                            <p className="text-foreground">₹{activity.rate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="text-foreground">{activity.amount ? `₹${activity.amount.toLocaleString()}` : "-"}</p>
                          </div>
                        </div>
                        {activity.goldImpact !== null && activity.goldImpact !== undefined && (
                          <div className="flex items-center justify-end mt-1.5 sm:mt-2">
                            <p className={`text-[10px] sm:text-xs font-bold ${
                              isPositive ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              {isPositive ? '+' : ''}{activity.goldImpact} g
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-card text-card-foreground border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-semibold">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAdminPage ? "Admin" : isCustomerPage ? "Customer" : "User"}
                </p>
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