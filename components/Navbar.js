"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut
} from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Deposit", msg: "User John Doe deposited ₹50,000", time: "2 min ago", type: "success" },
    { id: 2, title: "KYC Pending", msg: "New KYC verification request", time: "1 hour ago", type: "alert" },
    { id: 3, title: "Gold Rate", msg: "Gold rate updated to ₹7,645", time: "4 hours ago", type: "info" },
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

  const handleLogout = () => {
    router.push("/");
  };

  return (
    // Changed bg-background/95 backdrop-blur -> bg-background
    // This removes the blur and transparency, making it solid and synced with theme
    <nav className="h-16 border-b border-border bg-background px-6 flex items-center justify-between sticky top-0 z-20">
      
      {/* Left Side: Search Bar */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md border border-input focus-within:ring-2 focus-within:ring-ring transition-all">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm w-64 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right Side: Icons & Actions */}
      <div className="flex items-center gap-4">
        
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
            <div className="absolute right-0 mt-2 w-80 bg-card text-card-foreground border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <button onClick={() => setNotifications([])} className="text-xs text-primary hover:underline">Mark all read</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'alert' ? 'bg-destructive' : 'bg-blue-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.msg}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-border text-center">
                <button className="text-xs font-medium text-primary hover:underline">View All Activity</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors">
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* --- Admin Profile --- */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all outline-none"
          >
            KM
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card text-card-foreground border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@kampomido.com</p>
              </div>
              <div className="p-1">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left">
                  <User size={16} /> My Profile
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left">
                  <Settings size={16} /> Settings
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