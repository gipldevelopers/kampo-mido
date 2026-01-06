"use client";
import { useState, use, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft,
  AlertTriangle,
  Mail,
  Edit,
  Plus,
} from "lucide-react";
import Toast from "@/components/Toast";
import CustomerService from "@/services/admin/customer.service";

export default function CustomerDetail({ params }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("overview"); // overview, wallet, ledger
  const [toast, setToast] = useState(null);
  const [isSuspicious, setIsSuspicious] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const response = await CustomerService.getCustomerById(id);
        
        // Handle different response structures
        let customer = null;
        if (response.data) {
          customer = response.data;
        } else if (response.customer) {
          customer = response.customer;
        } else {
          customer = response;
        }

        if (customer) {
          setCustomerData({
            id: customer.id,
            fullName: customer.fullName || "N/A",
            email: customer.email || "N/A",
            mobile: customer.mobile || "N/A",
            whatsapp: customer.whatsapp || null,
            address: customer.address || "N/A",
            city: customer.city || null,
            state: customer.state || null,
            pincode: customer.pincode || null,
            gender: customer.gender || null,
            dob: customer.dob || null,
            accountNumber: customer.accountNumber || customer.customerCode || "N/A",
            kycStatus: customer.kycStatus || "pending",
            createdAt: customer.createdAt || null,
            user: customer.user || null,
          });
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch customer details";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  // Format full address
  const formatAddress = () => {
    if (!customerData) return "N/A";
    const parts = [
      customerData.address,
      customerData.city,
      customerData.state,
      customerData.pincode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : customerData.address || "N/A";
  };

  // Handlers
  const handleAction = (action) => {
    if (action === "deposit") setToast({ message: "Deposit module opening...", type: "success" });
    if (action === "message") setToast({ message: "Message sent to customer!", type: "success" });
    if (action === "suspicious") {
      setIsSuspicious(!isSuspicious);
      setToast({ message: isSuspicious ? "Customer marked as Safe" : "Customer marked as Suspicious", type: isSuspicious ? "success" : "alert" });
    }
    if (action === "approve_kyc") setToast({ message: "KYC Approved Successfully", type: "success" });
    if (action === "reject_kyc") setToast({ message: "KYC Rejected", type: "alert" });
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-4 sm:pb-6 md:pb-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-4 sm:pb-6 md:pb-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">Customer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-4 sm:pb-6 md:pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 1. Top Header & Actions */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link href="/admin/customers">
            <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
            </button>
          </Link>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="truncate">{customerData.fullName}</span>
              {isSuspicious && <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] sm:text-xs font-medium border border-destructive/20 shrink-0">Suspicious</span>}
            </h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">ID: {customerData.accountNumber} • Joined {formatDate(customerData.createdAt)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleAction('deposit')} className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 shadow-sm transition-all">
            <Plus size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Add Deposit</span>
          </button>
          <Link href={`/admin/customers/edit/${id}`}>
            <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm font-medium hover:bg-muted transition-colors">
              <Edit size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Edit</span>
            </button>
          </Link>
          <button onClick={() => handleAction('message')} className="p-1.5 sm:p-2 bg-background border border-input rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
            <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button onClick={() => handleAction('suspicious')} className={`p-1.5 sm:p-2 border rounded-md transition-colors ${isSuspicious ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-background border-input text-muted-foreground hover:text-destructive'}`}>
            <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* 2. Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
          {['overview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 3. Tab Content */}
      <div className="min-h-[300px] sm:min-h-[400px]">
        
        {/* --- Tab A: Profile Overview --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 animate-in slide-in-from-bottom-2 duration-300">
            {/* Personal Info */}
            <div className="md:col-span-2 bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm space-y-4 sm:space-y-5 md:space-y-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg border-b border-border pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-6 md:gap-x-8 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Full Name</p>
                  <p className="font-medium text-foreground break-words">{customerData.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Mobile Number</p>
                  <p className="font-medium text-foreground break-words">{customerData.mobile}</p>
                </div>
                {customerData.whatsapp && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">WhatsApp Number</p>
                    <p className="font-medium text-foreground break-words">{customerData.whatsapp}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Email Address</p>
                  <p className="font-medium text-foreground break-words">{customerData.email}</p>
                </div>
                {customerData.gender && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Gender</p>
                    <p className="font-medium text-foreground break-words capitalize">{customerData.gender}</p>
                  </div>
                )}
                {customerData.dob && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Date of Birth</p>
                    <p className="font-medium text-foreground break-words">{formatDate(customerData.dob)}</p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Residential Address</p>
                  <p className="font-medium text-foreground break-words">{formatAddress()}</p>
                </div>
                {customerData.accountNumber && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Account Number</p>
                    <p className="font-medium text-foreground break-words">{customerData.accountNumber}</p>
                  </div>
                )}
                {customerData.createdAt && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Joined Date</p>
                    <p className="font-medium text-foreground break-words">{formatDate(customerData.createdAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* KYC Section - Placeholder for now */}
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm space-y-4 sm:space-y-5 md:space-y-6 h-fit">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg">KYC Details</h3>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${
                  customerData.kycStatus?.toLowerCase() === 'verified' || customerData.kycStatus?.toLowerCase() === 'approved' 
                    ? 'bg-primary/10 text-primary border-primary/20' 
                    : customerData.kycStatus?.toLowerCase() === 'rejected'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-secondary text-secondary-foreground border-border'
                }`}>
                  {customerData.kycStatus ? customerData.kycStatus.charAt(0).toUpperCase() + customerData.kycStatus.slice(1) : "Pending"}
                </span>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-muted-foreground">KYC details will be available soon.</p>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab B: Wallet Summary --- */}
        {/* {activeTab === 'wallet' && (
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 md:p-10 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm sm:text-base text-muted-foreground text-center">Wallet details will be available soon.</p>
          </div>
        )} */}

        {/* --- Tab C: Ledger History --- */}
        {/* {activeTab === 'ledger' && (
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 md:p-10 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm sm:text-base text-muted-foreground text-center">Ledger history will be available soon.</p>
          </div>
        )} */}

      </div>
    </div>
  );
}