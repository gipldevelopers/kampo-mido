"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail,
  Edit,
  User,
  Phone,
  MapPin,
  Shield,
  Calendar,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Toast from "@/components/Toast";
import UserService from "@/services/admin/user.service";

export default function UserDetail({ params }) {
  const { id } = use(params);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await UserService.getUserById(id);
        
        // Handle different response structures
        // Preferred shape: { success, data: { ...user } }
        const userData =
          response.data?.data ||
          response.data?.user ||
          response.data ||
          response.user ||
          response;
        
        if (userData) {
          setUser(userData);
        } else {
          setToast({ message: "User not found", type: "error" });
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch user data";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  // Format user name
  const getUserName = () => {
    if (!user) return "N/A";
    if (user.name) return user.name;
    if (user.firstname || user.lastname) {
      return `${user.firstname || ""} ${user.lastname || ""}`.trim();
    }
    return "N/A";
  };

  // Format user email
  const getUserEmail = () => {
    return user?.email || "N/A";
  };

  // Format user phone (prioritize customer.mobile if available)
  const getUserPhone = () => {
    return (
      user?.customer?.mobile ||
      user?.phone ||
      user?.mobile ||
      "N/A"
    );
  };

  // Format user address
  const getUserAddress = () => {
    if (user?.customer) {
      const { address, city, state, pincode } = user.customer;
      const parts = [
        address || null,
        city || null,
        state || null,
        pincode ? `PIN ${pincode}` : null,
      ].filter(Boolean);
      if (parts.length) return parts.join(", ");
    }
    return user?.address || "N/A";
  };

  // Format user role
  const getUserRole = () => {
    if (!user?.role) return "N/A";
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  // Format user status
  const getUserStatus = () => {
    if (!user?.status) return "Inactive";
    return user.status.charAt(0).toUpperCase() + user.status.slice(1);
  };

  // Format created date
  const getCreatedDate = () => {
    if (!user?.createdAt) return "N/A";
    try {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return user.createdAt;
    }
  };

  // Handlers
  const handleAction = (action) => {
    if (action === "message") {
      setToast({ message: "Message functionality coming soon", type: "success" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-4 sm:pb-6 md:pb-10">
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-4 sm:pb-6 md:pb-10">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">User not found</p>
          </div>
        </div>
      </div>
    );
  }

  const isActive = getUserStatus().toLowerCase() === "active";

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-4 sm:pb-6 md:pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 1. Top Header & Actions */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link href="/admin/users">
            <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
            </button>
          </Link>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="truncate">{getUserName()}</span>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border shrink-0 ${
                isActive 
                  ? "bg-primary/10 text-primary border-primary/20" 
                  : "bg-muted text-muted-foreground border-border"
              }`}>
                {getUserStatus()}
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
              User ID: {user.id || id} • Joined {getCreatedDate()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/users/edit/${id}`}>
            <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm font-medium hover:bg-muted transition-colors">
              <Edit size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Edit</span>
            </button>
          </Link>
          <button onClick={() => handleAction('message')} className="p-1.5 sm:p-2 bg-background border border-input rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
            <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* 2. User Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Personal Information */}
        <div className="md:col-span-2 bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm space-y-4 sm:space-y-5 md:space-y-6">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg border-b border-border pb-2 flex items-center gap-2">
            <User size={18} className="text-primary shrink-0" />
            <span>Personal Information</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-6 md:gap-x-8 text-xs sm:text-sm">
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs flex items-center gap-1">
                <User size={12} className="shrink-0" />
                Full Name
              </p>
              <p className="font-medium text-foreground break-words">{getUserName()}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs flex items-center gap-1">
                <Phone size={12} className="shrink-0" />
                Phone Number
              </p>
              <p className="font-medium text-foreground break-words">{getUserPhone()}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs flex items-center gap-1">
                <Mail size={12} className="shrink-0" />
                Email Address
              </p>
              <p className="font-medium text-foreground break-words">{getUserEmail()}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs flex items-center gap-1">
                <Shield size={12} className="shrink-0" />
                Role
              </p>
              <p className="font-medium text-foreground break-words">{getUserRole()}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs flex items-center gap-1">
                <MapPin size={12} className="shrink-0" />
                Address
              </p>
              <p className="font-medium text-foreground break-words">{getUserAddress()}</p>
            </div>
            {user.customer && (
              <>
                <div>
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs flex items-center gap-1">
                    <Shield size={12} className="shrink-0" />
                    Customer Code
                  </p>
                  <p className="font-medium text-foreground break-words">{user.customer.customerCode || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs flex items-center gap-1">
                    <Shield size={12} className="shrink-0" />
                    Account Number
                  </p>
                  <p className="font-medium text-foreground break-words">{user.customer.accountNumber || "N/A"}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm space-y-4 sm:space-y-5 md:space-y-6 h-fit">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg flex items-center gap-2">
              <Shield size={18} className="text-primary shrink-0" />
              <span>Account Details</span>
            </h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-muted/50 rounded-md border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <CheckCircle2 size={14} className="text-primary shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-muted-foreground shrink-0" />
                    )}
                    <p className="text-xs sm:text-sm font-medium text-foreground">{getUserStatus()}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-md border border-border">
                <Calendar size={16} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Created At</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{getCreatedDate()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-md border border-border">
                <Shield size={16} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">User Role</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{getUserRole()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

