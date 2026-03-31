"use client";
import { useState, use, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Mail,
  Edit,
  Plus,
  FileText,
  Image,
  Eye,
  ExternalLink,
  User as UserIcon,
  CreditCard
} from "lucide-react";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";
import CustomerService from "@/services/admin/customer.service";
import AdminKYCSubmitService from "@/services/admin/admin-kyc-submit.service";
import DepositService from "@/services/admin/deposit.service";
import GoldRateService from "@/services/admin/gold-rate.service";

const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith('http')) return url;

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "";
  const base = serverURL.endsWith('/') ? serverURL.slice(0, -1) : serverURL;

  let path = url;
  if (url.includes('uploads')) {
    const parts = url.split('uploads');
    path = '/uploads' + parts[parts.length - 1];
  } else {
    path = '/uploads/' + (url.startsWith('/') ? url.slice(1) : url);
  }

  return `${base}${path.replace(/\/+/g, '/')}`;
};

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
            kycDocument: customer.kycDocument || null,
            nominee: customer.nominee || null,
            bankDetail: customer.bankDetail || null,
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

    if (action === "message") setToast({ message: "Message sent to customer!", type: "success" });
    if (action === "suspicious") {
      setIsSuspicious(!isSuspicious);
      setToast({ message: isSuspicious ? "Customer marked as Safe" : "Customer marked as Suspicious", type: isSuspicious ? "success" : "alert" });
    }
    if (action === "approve_kyc") setToast({ message: "KYC Approved Successfully", type: "success" });
    if (action === "reject_kyc") setToast({ message: "KYC Rejected", type: "alert" });
  };

  const [kycForm, setKycForm] = useState({
    idType: "Aadhaar",
    idNumber: "",
    panNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolder: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineeDob: "",
    nomineeAddress: "",
    nomineePhone: "",
  });

  // Pre-fill KYC form from customer data
  useEffect(() => {
    if (customerData) {
      setKycForm({
        idType: customerData.kycDocument?.idType || "Aadhaar",
        idNumber: customerData.kycDocument?.idNumber || "",
        panNumber: customerData.kycDocument?.panNumber || "",
        bankName: customerData.bankDetail?.bankName || "",
        accountNumber: customerData.bankDetail?.accountNumber || "",
        ifscCode: customerData.bankDetail?.ifscCode || "",
        accountHolder: customerData.bankDetail?.accountHolder || "",
        nomineeName: customerData.nominee?.name || "",
        nomineeRelation: customerData.nominee?.relationship || customerData.nominee?.relation || "",
        nomineeDob: customerData.nominee?.dob ? new Date(customerData.nominee.dob).toISOString().split('T')[0] : "",
        nomineeAddress: customerData.nominee?.address || "",
        nomineePhone: customerData.nominee?.phone || "",
      });
    }
  }, [customerData]);
  const [kycFiles, setKycFiles] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    selfie: null,
  });
  const [submittingKyc, setSubmittingKyc] = useState(false);

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setSubmittingKyc(true);
    try {
      await AdminKYCSubmitService.submitCustomerKYC(id, {
        ...kycForm,
        ...kycFiles,
      });
      setToast({ message: "KYC documents submitted and verified successfully!", type: "success" });
      setActiveTab("overview");
      // Refresh customer data
      const response = await CustomerService.getCustomerById(id);
      let customer = null;
      if (response.data) customer = response.data;
      else if (response.customer) customer = response.customer;
      else customer = response;

      if (customer) setCustomerData({
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
        kycDocument: customer.kycDocument || null,
        nominee: customer.nominee || null,
        bankDetail: customer.bankDetail || null,
      });
    } catch (error) {
      setToast({ message: error.response?.data?.message || "Failed to submit KYC", type: "error" });
    } finally {
      setSubmittingKyc(false);
    }
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
          <Link href="/staff/customers">
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
          <Link href="/admin/deposits" className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 shadow-sm transition-all">
            <Plus size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Add Deposit</span>
          </Link>
          <Link href={`/staff/customers/edit/${id}`}>
            <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm font-medium hover:bg-muted transition-colors">
              <Edit size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Edit</span>
            </button>
          </Link>
        </div>
      </div>      {/* 2. Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
          {['overview', 'deposits', 'kyc update'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab
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

            {/* KYC Section */}
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm space-y-4 sm:space-y-5 md:space-y-6 h-fit">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg">KYC Details</h3>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${customerData.kycStatus?.toLowerCase() === 'verified' || customerData.kycStatus?.toLowerCase() === 'approved'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : customerData.kycStatus?.toLowerCase() === 'rejected'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-secondary text-secondary-foreground border-border'
                  }`}>
                  {customerData.kycStatus ? customerData.kycStatus.charAt(0).toUpperCase() + customerData.kycStatus.slice(1) : "Pending"}
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {customerData.kycDocument ? (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Document Info */}
                    <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                      <div className="flex justify-between items-center py-1 border-b border-border/50">
                        <span className="text-muted-foreground">ID Type</span>
                        <span className="font-medium">{customerData.kycDocument.idType}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-border/50">
                        <span className="text-muted-foreground">ID Number</span>
                        <span className="font-medium">{customerData.kycDocument.idNumber}</span>
                      </div>
                      {customerData.kycDocument.panNumber && (
                        <div className="flex justify-between items-center py-1 border-b border-border/50">
                          <span className="text-muted-foreground">PAN Number</span>
                          <span className="font-medium">{customerData.kycDocument.panNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Document Previews */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { label: 'ID Front', url: customerData.kycDocument.idFront, icon: FileText },
                        { label: 'ID Back', url: customerData.kycDocument.idBack, icon: FileText },
                        { label: 'Selfie', url: customerData.kycDocument.selfie, icon: Image },
                        { label: 'PAN Card', url: customerData.kycDocument.panFile, icon: FileText }
                      ].filter(d => d.url).map((doc, idx) => (
                        <a
                          key={idx}
                          href={getFullImageUrl(doc.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 sm:p-3 bg-muted/30 border border-border rounded-lg hover:border-primary/40 transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                              <doc.icon size={16} />
                            </div>
                            <span className="text-xs sm:text-sm font-medium">{doc.label}</span>
                          </div>
                          <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary" />
                        </a>
                      ))}
                    </div>

                    {/* View Full KYC Request */}
                    <Link href={`/admin/kyc/${customerData.id}`} className="block">
                      <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-primary/5 text-primary border border-primary/20 rounded-md text-xs font-semibold hover:bg-primary/10 transition-colors">
                        <Eye size={14} /> View Full KYC Detail
                      </button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground italic text-center py-4 bg-muted/20 rounded-lg border border-dashed border-border">
                    No KYC documents submitted yet.
                  </p>
                )}
              </div>
            </div>

            {/* Nominee Details */}
            {customerData.nominee && (
              <div className="md:col-span-1 bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm space-y-4 sm:space-y-5 md:space-y-6">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg border-b border-border pb-2 flex items-center gap-2">
                  <UserIcon size={18} className="text-primary" /> Nominee
                </h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-muted-foreground text-[10px] sm:text-xs">Nominee Name</p>
                    <p className="font-medium">{customerData.nominee.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] sm:text-xs">Relationship</p>
                    <p className="font-medium">{customerData.nominee.relationship || customerData.nominee.relation || 'N/A'}</p>
                  </div>
                  {customerData.nominee.phone && (
                    <div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Contact Number</p>
                      <p className="font-medium">{customerData.nominee.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bank Details */}
            {customerData.bankDetail && (
              <div className="md:col-span-1 bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm space-y-4 sm:space-y-5 md:space-y-6">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg border-b border-border pb-2 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" /> Bank Details
                </h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-muted-foreground text-[10px] sm:text-xs">Bank Name</p>
                    <p className="font-medium">{customerData.bankDetail.bankName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] sm:text-xs">Account Number</p>
                    <p className="font-medium">{customerData.bankDetail.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] sm:text-xs">IFSC Code</p>
                    <p className="font-medium uppercase">{customerData.bankDetail.ifscCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] sm:text-xs">Account Holder</p>
                    <p className="font-medium">{customerData.bankDetail.accountHolder}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Tab B: Deposits List --- */}
        {activeTab === 'deposits' && (
          <div className="animate-in slide-in-from-bottom-2 duration-300">
            <CustomerDeposits 
              customerId={id} 
              formatDate={formatDate} 
              setToast={setToast}
            />
          </div>
        )}

        {/* --- Tab C: KYC Submission Form --- */}
        {activeTab === 'kyc update' && (
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <FileText className="text-primary" /> Update Customer KYC Documents
              </h3>
              
              <form onSubmit={handleKycSubmit} className="space-y-8">
                {/* Identity Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                    <UserIcon size={16} className="text-primary" /> Identity Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-muted-foreground">ID Type</label>
                      <select
                        className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={kycForm.idType}
                        onChange={(e) => setKycForm({ ...kycForm, idType: e.target.value })}
                      >
                        <option value="Aadhaar">Aadhaar Card</option>
                        <option value="PAN">PAN Card</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-muted-foreground">ID Number</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter ID Number"
                        className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={kycForm.idNumber}
                        onChange={(e) => setKycForm({ ...kycForm, idNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 space-y-1.5">
                      <label className="text-[12px] font-medium text-muted-foreground">PAN Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="Enter PAN Number"
                        className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={kycForm.panNumber}
                        onChange={(e) => setKycForm({ ...kycForm, panNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Aadhaar Front", key: "aadhaarFront" },
                      { label: "Aadhaar Back", key: "aadhaarBack" },
                      { label: "PAN Card Image", key: "panCard" },
                      { label: "Selfie", key: "selfie" },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-[12px] font-medium text-muted-foreground">{field.label}</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`file-${field.key}`}
                            onChange={(e) => setKycFiles({ ...kycFiles, [field.key]: e.target.files[0] })}
                          />
                          <label
                            htmlFor={`file-${field.key}`}
                            className="flex items-center justify-center gap-2 p-4 bg-muted/20 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/40 hover:border-primary/50 transition-all text-xs text-muted-foreground min-h-[80px] text-center"
                          >
                            {kycFiles[field.key] ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-primary font-medium truncate max-w-[200px]">{kycFiles[field.key].name}</span>
                                <span className="text-[10px] text-muted-foreground">Click to change</span>
                              </div>
                            ) : customerData?.kycDocument?.[field.key === 'aadhaarFront' ? 'idFront' : field.key === 'aadhaarBack' ? 'idBack' : field.key === 'panCard' ? 'panFile' : 'selfie'] ? (
                              <div className="flex flex-col items-center gap-1">
                                <FileText size={20} className="mb-1 text-primary/60" />
                                <span className="text-foreground font-medium">Existing Document</span>
                                <span className="text-[10px] text-muted-foreground">Click to replace</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <Plus size={20} className="mb-1 opacity-50" />
                                <span>Click to Upload</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                    <CreditCard size={16} className="text-primary" /> Bank Account Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="col-span-1 sm:col-span-2 space-y-1.5">
                      <label className="text-[12px] font-medium text-muted-foreground">Account Holder Name</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={kycForm.accountHolder}
                        onChange={(e) => setKycForm({ ...kycForm, accountHolder: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-muted-foreground">Bank Name</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={kycForm.bankName}
                        onChange={(e) => setKycForm({ ...kycForm, bankName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-muted-foreground">Account Number</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={kycForm.accountNumber}
                        onChange={(e) => setKycForm({ ...kycForm, accountNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-muted-foreground">IFSC Code</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={kycForm.ifscCode}
                        onChange={(e) => setKycForm({ ...kycForm, ifscCode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Nominee Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                    <UserIcon size={16} className="text-primary" /> Nominee Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="col-span-1 sm:col-span-2 space-y-1.5">
                      <label className="text-[12px] font-medium text-muted-foreground">Nominee Name</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={kycForm.nomineeName}
                        onChange={(e) => setKycForm({ ...kycForm, nomineeName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-muted-foreground">Relationship</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={kycForm.nomineeRelation}
                        onChange={(e) => setKycForm({ ...kycForm, nomineeRelation: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-muted-foreground">Nominee Phone</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={kycForm.nomineePhone}
                        onChange={(e) => setKycForm({ ...kycForm, nomineePhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-6 py-2.5 bg-secondary text-secondary-foreground border border-input rounded-md text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingKyc}
                    className="px-8 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    {submittingKyc ? "Submitting..." : "Submit & Verify customer KYC"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Separate component for Customer Deposits for better management
function CustomerDeposits({ customerId, formatDate, setToast }) {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncingId, setSyncingId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [manualRateInput, setManualRateInput] = useState("");

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const response = await DepositService.getCustomerDeposits(customerId);
      setDeposits(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [customerId]);

  const handleSyncRate = (deposit) => {
    setSelectedDeposit(deposit);
    setManualRateInput(deposit.rateLockedValue || deposit.rateLockedRecord || "");
    setIsModalOpen(true);
  };

  const handleSaveManualRate = async () => {
    if (!manualRateInput || isNaN(manualRateInput)) {
      setToast({ message: "Please enter a valid numeric rate.", type: "alert" });
      return;
    }

    try {
      setSyncingId(selectedDeposit.id);
      setIsModalOpen(false);
      
      await DepositService.updateDeposit(selectedDeposit.id, {
        goldRateLockValue: parseFloat(manualRateInput)
      });

      // Refresh data
      await fetchDeposits();
      setToast({ message: "Gold rate updated manually for this deposit!", type: "success" });
    } catch (err) {
      setToast({ message: `Failed to update rate: ${err.message}`, type: "alert" });
    } finally {
      setSyncingId(null);
    }
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading deposits...</div>;
  if (error) return <div className="text-center py-10 text-destructive">{error}</div>;
  if (deposits.length === 0) return (
    <div className="text-center py-10 bg-muted/20 border border-dashed border-border rounded-xl">
      <p className="text-muted-foreground italic">No deposits found for this customer.</p>
      <Link href="/admin/deposits" className="mt-4 inline-block text-primary text-sm font-semibold hover:underline">
        Go to Deposits Management
      </Link>
    </div>
  );

  return (
    <>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Manual Gold Rate Override"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the gold rate (per gram) that should be applied to this deposit (ID: {selectedDeposit?.transactionId}).
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate Per Gram (₹)</label>
            <input 
              type="number" 
              value={manualRateInput}
              onChange={(e) => setManualRateInput(e.target.value)}
              placeholder="e.g. 7500.50"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveManualRate}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90"
            >
              Save Rate
            </button>
          </div>
        </div>
      </Modal>

      <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 font-semibold text-muted-foreground">ID</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Amount</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Gold (g)</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Rate Locked/Used</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {deposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3 font-medium text-foreground">{deposit.transactionId}</td>
                  <td className="px-4 py-3 font-bold text-foreground">₹{deposit.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(deposit.depositDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${deposit.status === 'converted'
                      ? 'bg-status-success/10 text-status-success border-status-success/20'
                      : deposit.status === 'pending'
                        ? 'bg-status-warning/10 text-status-warning border-status-warning/20'
                        : deposit.status === 'rejected'
                          ? 'bg-status-error/10 text-status-error border-status-error/20'
                          : 'bg-secondary text-secondary-foreground border-border'
                      }`}>
                      {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {deposit.gold ? `${deposit.gold.toFixed(4)}g` : '--'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground flex flex-col">
                    {deposit.rateUsed ? (
                      <span className="text-foreground font-medium">₹{deposit.rateUsed}/g (Used)</span>
                    ) : deposit.rateLockedValue ? (
                      <span className="text-primary font-medium">₹{deposit.rateLockedValue}/g (Manual)</span>
                    ) : deposit.rateLockedRecord ? (
                      <span className="text-primary/70 font-medium">₹{deposit.rateLockedRecord}/g (Auto)</span>
                    ) : (
                      <span className="text-muted-foreground italic">Not Set</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(deposit.status === 'pending' || deposit.status === 'converted') && !deposit.rateLockedValue && !deposit.rateLockedRecord && !deposit.rateUsed && (
                      <button
                        onClick={() => handleSyncRate(deposit)}
                        disabled={syncingId === deposit.id}
                        className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-semibold hover:bg-primary/20 transition-all disabled:opacity-50"
                      >
                        {syncingId === deposit.id ? 'Setting...' : 'Set Rate'}
                      </button>
                    )}
                    {(deposit.status === 'pending' || deposit.status === 'approved' || deposit.status === 'converted') && (deposit.rateLockedValue || deposit.rateLockedRecord || deposit.rateUsed) && (
                      <button
                        onClick={() => handleSyncRate(deposit)}
                        disabled={syncingId === deposit.id}
                        className="px-2 py-1 bg-muted border border-border rounded text-[10px] font-semibold hover:bg-muted/80 transition-all disabled:opacity-50"
                      >
                        {syncingId === deposit.id ? 'Updating...' : 'Update Rate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

