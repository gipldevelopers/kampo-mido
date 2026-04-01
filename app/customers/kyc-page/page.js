"use client";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Upload,
  User,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCcw,
  Landmark,
  Eye,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Toast from "@/components/Toast";
import KYCService from "@/services/customer/kyc.service";

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "text-secondary-foreground bg-secondary border-secondary",
    Verified: "text-primary bg-primary/10 border-primary/20",
    Approved: "text-primary bg-primary/10 border-primary/20",
    Rejected: "text-destructive bg-destructive/10 border-destructive/20",
    "Re-upload Requested": "text-orange-600 bg-orange-50 border-orange-200",
  };
  const icons = {
    Pending: Clock,
    Verified: CheckCircle2,
    Approved: CheckCircle2,
    Rejected: XCircle,
    "Re-upload Requested": RefreshCcw,
  };
  const Icon = icons[status] || Clock;
  return (
    <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border flex items-center gap-0.5 sm:gap-1 w-fit ${styles[status] || styles.Pending}`}>
      <Icon size={10} className="sm:w-3 sm:h-3" />
      {status}
    </span>
  );
};

/**
 * Premium Date of Birth Picker Component
 * Provides a Year-first selection flow for fast access to birth years.
 */
function PremiumDobPicker({ value, onChange, error, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("year"); // year, month, day
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null); // 0-based

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 110 }, (_, i) => currentYear - i);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const handleOpen = () => {
    if (disabled) return;
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedYear(d.getFullYear());
        setSelectedMonth(d.getMonth());
      }
    }
    setView("year");
    setIsOpen(true);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setView("month");
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
    setView("day");
  };

  const handleDaySelect = (day) => {
    const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const formatDisplayDate = (val) => {
    if (!val) return "Select Date";
    const [y, m, d] = val.split("-");
    if (!y || !m || !d) return val; // Fallback for other formats
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 bg-background border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${error ? "border-destructive ring-1 ring-destructive/20" : "border-input"
          }`}
      >
        <span className={!value ? "text-muted-foreground" : ""}>
          {formatDisplayDate(value)}
        </span>
        <CalendarIcon size={14} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[340px] z-[70] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                {view === "year" ? "Select Year" : view === "month" ? `Select Month (${selectedYear})` : `Select Day (${months[selectedMonth]} ${selectedYear})`}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
              {view === "year" && (
                <div className="grid grid-cols-4 gap-2">
                  {years.map((year) => (
                    <button
                      type="button"
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={`py-2 text-sm rounded-lg transition-all ${selectedYear === year ? "bg-primary text-primary-foreground font-bold" : "hover:bg-primary/10 text-foreground"
                        }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}

              {view === "month" && (
                <div className="grid grid-cols-3 gap-3">
                  {months.map((month, idx) => (
                    <button
                      type="button"
                      key={month}
                      onClick={() => handleMonthSelect(idx)}
                      className={`py-4 text-sm rounded-xl border transition-all ${selectedMonth === idx ? "bg-primary text-primary-foreground border-primary font-bold shadow-lg" : "bg-muted/30 hover:bg-muted border-border text-foreground"
                        }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}

              {view === "day" && (
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleDaySelect(day)}
                      className="aspect-square flex items-center justify-center text-sm rounded-lg hover:bg-primary/20 text-foreground transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-primary/30"
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {(view === "month" || view === "day") && (
              <div className="p-3 border-t border-border flex justify-start">
                <button
                  type="button"
                  onClick={() => setView(view === "day" ? "month" : "year")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Back to {view === "day" ? "Month" : "Year"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function KYCPage() {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [kycStatus, setKycStatus] = useState("Pending");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Document uploads
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [panCardPreview, setPanCardPreview] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);

  // ID details
  const [idType, setIdType] = useState("Aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");

  // Bank details
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  // Nominee details
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");
  const [nomineeDob, setNomineeDob] = useState("");
  const [nomineeAddress, setNomineeAddress] = useState("");
  const [nomineePhone, setNomineePhone] = useState("");

  // Re-upload / Rejection info
  const [adminNotes, setAdminNotes] = useState("");
  const [requestedDocs, setRequestedDocs] = useState([]);

  // Fetch KYC status on mount
  useEffect(() => {
    const fetchKYCStatus = async () => {
      setFetchingStatus(true);
      try {
        const response = await KYCService.getKYCStatus();

        let status = "Pending";
        let data = response.data || response;

        if (data) {
          status = data.status || data.kycStatus || "Pending";

          // Populate existing data if available
          if (data.idType) setIdType(data.idType);
          if (data.idNumber) setIdNumber(data.idNumber);
          if (data.panNumber) setPanNumber(data.panNumber);

          // Bank data
          if (data.bankDetail) {
            setBankName(data.bankDetail.bankName || "");
            setAccountNumber(data.bankDetail.accountNumber || "");
            setConfirmAccountNumber(data.bankDetail.accountNumber || "");
            setIfscCode(data.bankDetail.ifscCode || "");
            setAccountHolder(data.bankDetail.accountHolder || "");
          }

          // Nominee data
          if (data.nominee) {
            setNomineeName(data.nominee.name || "");
            setNomineeRelation(data.nominee.relation || data.nominee.relationship || "");
            setNomineeDob(data.nominee.dob || "");
            setNomineeAddress(data.nominee.address || "");
            setNomineePhone(data.nominee.phone || "");
          }

          // Re-upload info
          setAdminNotes(data.notes || data.rejectionReason || "");
          setRequestedDocs(data.documentsToReupload || []);

          // Populate existing document previews if available
          if (data.documents) {
            const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
            const docs = data.documents;

            if (docs.aadhaarFront) setAadhaarFrontPreview(`${baseURL}${docs.aadhaarFront}`);
            if (docs.aadhaarBack) setAadhaarBackPreview(`${baseURL}${docs.aadhaarBack}`);
            if (docs.panCard) setPanCardPreview(`${baseURL}${docs.panCard}`);
            if (docs.selfie) setSelfiePreview(`${baseURL}${docs.selfie}`);
          }
        }

        // Normalize status
        const rawStatus = status.toLowerCase();
        let finalStatus = "Pending";

        if (rawStatus === "approved" || rawStatus === "verified") {
          finalStatus = "Verified";
        } else if (rawStatus === "rejected") {
          finalStatus = "Rejected";
        } else if (rawStatus === "reupload_requested" || rawStatus === "action_required") {
          finalStatus = "Re-upload Requested";
        } else if (rawStatus === "pending") {
          finalStatus = "Pending";
        }

        setKycStatus(finalStatus);

        // Populate flags
        if (finalStatus === "Verified" || finalStatus === "Approved" || rawStatus === "pending") {
          setIsSubmitted(true); // Locked for approved or pending (no client submission allowed)
        } else {
          setIsSubmitted(false); // Maybe allow re-upload if rejected? 
          // (User said "customer wont be send the kyc docs", so keeping it mostly locked)
          setIsSubmitted(true);
        }

      } catch (error) {
        console.error("Error fetching KYC status:", error);
      } finally {
        setFetchingStatus(false);
      }
    };

    fetchKYCStatus();
  }, []);

  const handleFileUpload = (file, setFile, setPreview, fieldKey, maxSize = 5) => {
    // Prevent file upload if already submitted, unless this specific field is requested for re-upload
    const isRequested = requestedDocs.includes(fieldKey);
    if (isSubmitted && !isRequested) {
      setToast({ message: "KYC has already been submitted. You cannot modify the documents.", type: "error" });
      return;
    }
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        setToast({ message: `Image size should be less than ${maxSize}MB`, type: "error" });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setToast({ message: "Please select a valid image file", type: "error" });
        return;
      }
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (setFile, setPreview, fieldKey) => {
    // Prevent file removal if already submitted, unless this specific field is requested for re-upload
    const isRequested = requestedDocs.includes(fieldKey);
    if (isSubmitted && !isRequested) {
      setToast({ message: "KYC has already been submitted. You cannot remove documents.", type: "error" });
      return;
    }
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const FileUploadSection = ({ title, description, file, preview, setFile, setPreview, required = true, fieldKey }) => {
    const isRequested = requestedDocs.includes(fieldKey);
    const isDisabled = isSubmitted && !isRequested;

    return (
      <div className={`space-y-1.5 sm:space-y-2 p-2 rounded-lg transition-all duration-300 ${isRequested ? "bg-orange-50/50 border border-orange-200 ring-1 ring-orange-200" : "border border-transparent"}`}>
        <div className="flex items-center justify-between">
          <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
            {title} {required && <span className="text-destructive">*</span>}
          </label>
          {isRequested && (
            <span className="text-[9px] sm:text-[10px] font-bold text-orange-600 uppercase tracking-wider bg-orange-100 px-1.5 py-0.5 rounded">Action Required</span>
          )}
        </div>
        {preview ? (
          <div className="relative">
            <div className={`border rounded-lg p-2 sm:p-3 md:p-4 bg-muted/30 border-border`}>
              <img
                src={preview}
                alt={title}
                className="max-w-full h-auto max-h-48 sm:max-h-56 md:max-h-64 rounded-md mx-auto"
              />
            </div>
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex gap-2">
              <button
                type="button"
                onClick={() => window.open(preview, '_blank')}
                className="p-1.5 sm:p-2 bg-background/80 text-foreground rounded-full hover:bg-background transition-all shadow-md group border border-border"
                aria-label="View file"
                title="View Full Size"
              >
                <Eye size={12} className="sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full px-3 sm:px-4 py-6 sm:py-8 bg-muted/10 border-2 border-dashed rounded-lg border-border opacity-60">
            <ImageIcon size={24} className="sm:w-8 sm:h-8 mb-1.5 sm:mb-2 text-muted-foreground" />
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground">Document not available</p>
          </div>
        )}
        {description && <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">{description}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">KYC Verification</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">Upload your documents to complete KYC verification.</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Status:</span>
          {fetchingStatus ? (
            <div className="flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <StatusBadge status={kycStatus} />
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">

        {/* LEFT COLUMN: KYC Form (Span 2) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">

          {/* ID Documents */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
              <FileText size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">ID Documents</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* ID Information */}
              <div className="pb-3 sm:pb-4 border-b border-border">
                <h4 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">ID Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                      ID Type
                    </label>
                    <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium">
                      {idType}
                    </p>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                      {idType} Number
                    </label>
                    <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium tracking-widest">
                      {idNumber || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2 mt-4 sm:mt-5">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                    PAN Number
                  </label>
                  <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium uppercase">
                    {panNumber || "N/A"}
                  </p>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="pt-2 sm:pt-3">
                <h4 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Verified Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <FileUploadSection
                    title="Aadhaar Front"
                    file={aadhaarFront}
                    preview={aadhaarFrontPreview}
                    setFile={setAadhaarFront}
                    setPreview={setAadhaarFrontPreview}
                    fieldKey="idFront"
                    required={false}
                  />
                  <FileUploadSection
                    title="Aadhaar Back"
                    file={aadhaarBack}
                    preview={aadhaarBackPreview}
                    setFile={setAadhaarBack}
                    setPreview={setAadhaarBackPreview}
                    fieldKey="idBack"
                    required={false}
                  />
                </div>

                <div className="mt-4 sm:mt-5 md:mt-6">
                  <FileUploadSection
                    title="PAN Card"
                    file={panCard}
                    preview={panCardPreview}
                    setFile={setPanCard}
                    setPreview={setPanCardPreview}
                    fieldKey="panFile"
                    required={false}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Selfie Upload */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
              <User size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Selfie Verification</h3>
            </div>

            <FileUploadSection
              title="Selfie Photo"
              description="Take a clear selfie holding your Aadhaar card next to your face"
              file={selfie}
              preview={selfiePreview}
              setFile={setSelfie}
              setPreview={setSelfiePreview}
              fieldKey="selfie"
            />
          </div>

          {/* Bank Details */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
              <Landmark size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Bank Details</h3>
            </div>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                    Account Holder Name
                  </label>
                  <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium">
                    {accountHolder || "N/A"}
                  </p>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                    Bank Name
                  </label>
                  <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium">
                    {bankName || "N/A"}
                  </p>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                    Account Number
                  </label>
                  <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium tracking-wider">
                    {accountNumber ? '•'.repeat(accountNumber.length - 4) + accountNumber.slice(-4) : "N/A"}
                  </p>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                    IFSC Code
                  </label>
                  <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium uppercase">
                    {ifscCode || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nominee Details */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
              <User size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Nominee Details</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                  Nominee Name
                </label>
                <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium">
                  {nomineeName || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                    Relation
                  </label>
                  <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium">
                    {nomineeRelation || "N/A"}
                  </p>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                    Phone Number
                  </label>
                  <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium">
                    {nomineePhone || "N/A"}
                  </p>
                </div>
              </div>

              {nomineeDob && (
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                    Date of Birth
                  </label>
                  <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium">
                    {new Date(nomineeDob).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}

              {nomineeAddress && (
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-tight">
                    Address
                  </label>
                  <p className="px-3 py-2 bg-muted/20 border border-border rounded-md text-[11px] sm:text-xs md:text-sm text-foreground font-medium">
                    {nomineeAddress}
                  </p>
                </div>
              )}

              <div className="bg-primary/5 p-3 sm:p-4 rounded-lg border border-primary/20 mt-4">
                <p className="text-[9px] sm:text-[10px] md:text-xs font-medium text-primary flex items-center gap-1.5">
                  <ShieldCheck size={14} /> This information has been verified and cannot be edited.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: KYC Status & Info (Span 1) */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">

          {/* KYC Status Card */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">KYC Status</h3>

            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Current Status</span>
                  {fetchingStatus ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin text-muted-foreground" />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <StatusBadge status={kycStatus} />
                  )}
                </div>
                {!fetchingStatus && (
                  <div className="space-y-2">
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                      {kycStatus === "Pending" && (isSubmitted ? "Your KYC is under review. Please wait for admin approval." : "Please upload your documents to start the verification process.")}
                      {kycStatus === "Verified" && "Your KYC has been verified. You can use all platform features."}
                      {kycStatus === "Rejected" && "Your KYC was rejected. Please review the notes and re-upload documents."}
                      {kycStatus === "Re-upload Requested" && "Admin has requested a re-upload of specific documents."}
                    </p>
                    {adminNotes && (kycStatus === "Rejected" || kycStatus === "Re-upload Requested") && (
                      <div className="p-2 bg-destructive/5 border border-destructive/20 rounded-md">
                        <p className="text-[9px] sm:text-[10px] font-semibold text-destructive mb-0.5">Admin Note:</p>
                        <p className="text-[9px] sm:text-[10px] text-foreground italic">"{adminNotes}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-muted-foreground">Aadhaar</span>
                  <span className={`font-medium ${kycStatus === "Verified" || kycStatus === "Approved"
                    ? "text-primary"
                    : aadhaarFront && aadhaarBack
                      ? "text-foreground"
                      : "text-muted-foreground"
                    }`}>
                    {kycStatus === "Verified" || kycStatus === "Approved"
                      ? "✓ Approved"
                      : aadhaarFront && aadhaarBack
                        ? "✓ Uploaded"
                        : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-muted-foreground">PAN Card</span>
                  <span className={`font-medium ${kycStatus === "Verified" || kycStatus === "Approved"
                    ? "text-primary"
                    : panCard
                      ? "text-foreground"
                      : "text-muted-foreground"
                    }`}>
                    {kycStatus === "Verified" || kycStatus === "Approved"
                      ? "✓ Approved"
                      : panCard
                        ? "✓ Uploaded"
                        : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-muted-foreground">Selfie</span>
                  <span className={`font-medium ${kycStatus === "Verified" || kycStatus === "Approved"
                    ? "text-primary"
                    : selfie
                      ? "text-foreground"
                      : "text-muted-foreground"
                    }`}>
                    {kycStatus === "Verified" || kycStatus === "Approved"
                      ? "✓ Approved"
                      : selfie
                        ? "✓ Uploaded"
                        : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-muted-foreground">Nominee</span>
                  <span className={`font-medium ${kycStatus === "Verified" || kycStatus === "Approved"
                    ? "text-primary"
                    : nomineeName
                      ? "text-foreground"
                      : "text-muted-foreground"
                    }`}>
                    {kycStatus === "Verified" || kycStatus === "Approved"
                      ? "✓ Approved"
                      : nomineeName
                        ? "✓ Added"
                        : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-1.5 sm:mb-2">KYC Requirements</p>
            <ul className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground space-y-0.5 sm:space-y-1 list-disc list-inside">
              <li>Clear, readable documents</li>
              <li>All corners visible</li>
              <li>No blur or glare</li>
              <li>Valid, non-expired documents</li>
              <li>Selfie with Aadhaar card</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}

