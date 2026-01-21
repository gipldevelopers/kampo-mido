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
  Eye
} from "lucide-react";
import Toast from "@/components/Toast";
import KYCService from "@/services/customer/kyc.service";
import NomineeService from "@/services/customer/nominee.service";

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "text-secondary-foreground bg-secondary border-secondary",
    Verified: "text-primary bg-primary/10 border-primary/20",
    Rejected: "text-destructive bg-destructive/10 border-destructive/20",
    "Re-upload Requested": "text-orange-600 bg-orange-50 border-orange-200",
  };
  const icons = {
    Pending: Clock,
    Verified: CheckCircle2,
    Rejected: XCircle,
    "Re-upload Requested": RefreshCcw, // I should add RefreshCcw to imports
  };
  const Icon = icons[status] || Clock;
  return (
    <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border flex items-center gap-0.5 sm:gap-1 w-fit ${styles[status] || styles.Pending}`}>
      <Icon size={10} className="sm:w-3 sm:h-3" />
      {status}
    </span>
  );
};

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
        let locked = false;

        if (rawStatus === "approved" || rawStatus === "verified") {
          finalStatus = "Verified";
          locked = true;
        } else if (rawStatus === "rejected") {
          finalStatus = "Rejected";
          locked = false; // Allow fix
        } else if (rawStatus === "reupload_requested" || rawStatus === "action_required") {
          finalStatus = "Re-upload Requested";
          locked = false; // Allow fix
        } else if (rawStatus === "pending") {
          finalStatus = "Pending";
          // Only lock if we have documents in local storage indicating an active submission
          const submitted = typeof window !== "undefined" ? localStorage.getItem("kycSubmitted") : null;
          if (submitted === "true") {
            locked = true;
          }
        }

        setKycStatus(finalStatus);
        setIsSubmitted(locked);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(aadhaarFront || aadhaarFrontPreview) ||
      !(aadhaarBack || aadhaarBackPreview) ||
      !(panCard || panCardPreview) ||
      !(selfie || selfiePreview)) {
      setToast({ message: "Please upload all required documents", type: "error" });
      return;
    }

    if (!idNumber || !panNumber) {
      setToast({ message: "Please enter Aadhaar number and PAN number", type: "error" });
      return;
    }

    if (!bankName || !accountNumber || !confirmAccountNumber || !ifscCode || !accountHolder) {
      setToast({ message: "Please fill all bank details", type: "error" });
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      setToast({ message: "Account numbers do not match", type: "error" });
      return;
    }

    if (!nomineeName || !nomineeRelation || !nomineeDob || !nomineeAddress || !nomineePhone) {
      setToast({ message: "Please fill all nominee details", type: "error" });
      return;
    }

    // Validate Nominee DOB (cannot be in future)
    const selectedDate = new Date(nomineeDob);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      setToast({ message: "Nominee Date of Birth cannot be in the future", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // Call both APIs in parallel
      await Promise.all([
        KYCService.uploadKYC({
          aadhaarFront,
          aadhaarBack,
          panCard,
          selfie,
          idType,
          idNumber,
          panNumber,
          bankName,
          accountNumber,
          ifscCode,
          accountHolder
        }),
        NomineeService.createNominee({
          name: nomineeName,
          relationship: nomineeRelation,
          dob: nomineeDob,
          address: nomineeAddress,
          phone: nomineePhone,
        }),
      ]);

      setToast({ message: "KYC documents and nominee details submitted successfully! Admin will verify and approve.", type: "success" });

      // Mark as submitted and save to localStorage
      setIsSubmitted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("kycSubmitted", "true");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit. Please try again.";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
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
            <div className={`border rounded-lg p-2 sm:p-3 md:p-4 bg-muted/30 ${isRequested ? "border-orange-300 shadow-sm" : "border-border"}`}>
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
              {!isDisabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(setFile, setPreview, fieldKey)}
                  className="p-1.5 sm:p-2 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-all shadow-md group"
                  aria-label="Remove file"
                  title="Remove"
                >
                  <X size={12} className="sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <label className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files[0], setFile, setPreview, fieldKey)}
              disabled={isDisabled}
              className="hidden"
              required={required && !preview}
            />
            <div className={`flex flex-col items-center justify-center w-full px-3 sm:px-4 py-6 sm:py-8 bg-muted/30 border-2 border-dashed rounded-lg transition-all ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"} ${isRequested ? "border-orange-400 bg-orange-50/30 ring-1 ring-orange-100" : "border-border"}`}>
              <ImageIcon size={24} className={`sm:w-8 sm:h-8 mb-1.5 sm:mb-2 ${isRequested ? "text-orange-500 animate-pulse" : "text-muted-foreground"}`} />
              <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-0.5 sm:mb-1">Click to upload {title.toLowerCase()}</p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">PNG, JPG or GIF (Max 5MB)</p>
            </div>
          </label>
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
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                      ID Type <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      disabled={isSubmitted}
                      className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="Aadhaar">Aadhaar</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                      {idType} Number <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder={`Enter ${idType} number`}
                      disabled={isSubmitted}
                      className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2 mt-4 sm:mt-5">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                    PAN Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="Enter PAN number (e.g., ABCDE1234F)"
                    maxLength={10}
                    disabled={isSubmitted}
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              {/* Document Uploads */}
              <div className="pt-2 sm:pt-3">
                <h4 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Document Uploads</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <FileUploadSection
                    title="Aadhaar Front"
                    description="Upload front side of your Aadhaar card"
                    file={aadhaarFront}
                    preview={aadhaarFrontPreview}
                    setFile={setAadhaarFront}
                    setPreview={setAadhaarFrontPreview}
                    fieldKey="idFront"
                  />
                  <FileUploadSection
                    title="Aadhaar Back"
                    description="Upload back side of your Aadhaar card"
                    file={aadhaarBack}
                    preview={aadhaarBackPreview}
                    setFile={setAadhaarBack}
                    setPreview={setAadhaarBackPreview}
                    fieldKey="idBack"
                  />
                </div>

                <div className="mt-4 sm:mt-5 md:mt-6">
                  <FileUploadSection
                    title="PAN Card"
                    description="Upload your PAN card (both sides if applicable)"
                    file={panCard}
                    preview={panCardPreview}
                    setFile={setPanCard}
                    setPreview={setPanCardPreview}
                    fieldKey="panFile"
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
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                    Account Holder Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Enter account holder name"
                    disabled={isSubmitted}
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                    Bank Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                    disabled={isSubmitted}
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                    Account Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    disabled={isSubmitted}
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                    Confirm Account Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value)}
                    placeholder="Re-enter account number"
                    disabled={isSubmitted}
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                    IFSC Code <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="Enter IFSC code"
                    disabled={isSubmitted}
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
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
                <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                  Nominee Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  placeholder="Enter nominee full name"
                  disabled={isSubmitted}
                  className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                  Relation <span className="text-destructive">*</span>
                </label>
                <select
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  disabled={isSubmitted}
                  className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select relation</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                  Date of Birth <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={nomineeDob}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  onChange={(e) => setNomineeDob(e.target.value)}
                  disabled={isSubmitted}
                  className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                  Address <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={nomineeAddress}
                  onChange={(e) => setNomineeAddress(e.target.value)}
                  placeholder="Enter complete address"
                  disabled={isSubmitted}
                  className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  value={nomineePhone}
                  onChange={(e) => setNomineePhone(e.target.value)}
                  placeholder="Enter phone number"
                  disabled={isSubmitted}
                  className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="bg-muted/30 p-3 sm:p-4 rounded-lg border border-border">
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> All documents must be clear and readable.
                  Ensure all information is visible and not blurred. Admin will verify your documents and approve your KYC.
                </p>
              </div>

              <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row justify-end gap-2">
                <button
                  type="submit"
                  disabled={loading || isSubmitted}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-[11px] sm:text-xs md:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} className="sm:w-4 sm:h-4" /> <span>Submit KYC</span>
                    </>
                  )}
                </button>
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

