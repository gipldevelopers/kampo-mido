"use client";
import { useState } from "react";
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
  Loader2
} from "lucide-react";
import Toast from "@/components/Toast";

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "text-secondary-foreground bg-secondary border-secondary",
    Verified: "text-primary bg-primary/10 border-primary/20",
    Rejected: "text-destructive bg-destructive/10 border-destructive/20",
  };
  const icons = {
    Pending: Clock,
    Verified: CheckCircle2,
    Rejected: XCircle,
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
  const [kycStatus] = useState("Pending");
  
  // Document uploads
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [panCardPreview, setPanCardPreview] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);

  // Nominee details
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");
  const [nomineeDob, setNomineeDob] = useState("");
  const [nomineeAddress, setNomineeAddress] = useState("");

  const handleFileUpload = (file, setFile, setPreview, maxSize = 5) => {
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

  const handleRemoveFile = (setFile, setPreview) => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!aadhaarFront || !aadhaarBack || !panCard || !selfie) {
      setToast({ message: "Please upload all required documents", type: "error" });
      return;
    }

    if (!nomineeName || !nomineeRelation || !nomineeDob || !nomineeAddress) {
      setToast({ message: "Please fill all nominee details", type: "error" });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ message: "KYC documents submitted successfully! Admin will verify and approve.", type: "success" });
    }, 1500);
  };

  const FileUploadSection = ({ title, description, file, preview, setFile, setPreview, required = true }) => (
    <div className="space-y-1.5 sm:space-y-2">
      <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
        {title} {required && <span className="text-destructive">*</span>}
      </label>
      {preview ? (
        <div className="relative">
          <div className="border border-border rounded-lg p-2 sm:p-3 md:p-4 bg-muted/30">
            <img 
              src={preview} 
              alt={title} 
              className="max-w-full h-auto max-h-48 sm:max-h-56 md:max-h-64 rounded-md mx-auto"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveFile(setFile, setPreview)}
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
            aria-label="Remove file"
          >
            <X size={12} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0], setFile, setPreview)}
            className="hidden"
            required={required}
          />
          <div className="flex flex-col items-center justify-center w-full px-3 sm:px-4 py-6 sm:py-8 bg-muted/30 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors">
            <ImageIcon size={24} className="sm:w-8 sm:h-8 text-muted-foreground mb-1.5 sm:mb-2" />
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-0.5 sm:mb-1">Click to upload {title.toLowerCase()}</p>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">PNG, JPG or GIF (Max 5MB)</p>
          </div>
        </label>
      )}
      {description && <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">{description}</p>}
    </div>
  );

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
          <StatusBadge status={kycStatus} />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <FileUploadSection
                  title="Aadhaar Front"
                  description="Upload front side of your Aadhaar card"
                  file={aadhaarFront}
                  preview={aadhaarFrontPreview}
                  setFile={setAadhaarFront}
                  setPreview={setAadhaarFrontPreview}
                />
                <FileUploadSection
                  title="Aadhaar Back"
                  description="Upload back side of your Aadhaar card"
                  file={aadhaarBack}
                  preview={aadhaarBackPreview}
                  setFile={setAadhaarBack}
                  setPreview={setAadhaarBackPreview}
                />
              </div>

              <FileUploadSection
                title="PAN Card"
                description="Upload your PAN card (both sides if applicable)"
                file={panCard}
                preview={panCardPreview}
                setFile={setPanCard}
                setPreview={setPanCardPreview}
              />
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
            />
          </div>

          {/* Nominee Details */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
              <User size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Nominee Details</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                    Nominee Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    placeholder="Enter nominee full name"
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
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
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
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
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                  Date of Birth <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={nomineeDob}
                  onChange={(e) => setNomineeDob(e.target.value)}
                  className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
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
                  className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y"
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
                  disabled={loading}
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
                  <StatusBadge status={kycStatus} />
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                  {kycStatus === "Pending" && "Your KYC is under review. Please wait for admin approval."}
                  {kycStatus === "Verified" && "Your KYC has been verified. You can use all platform features."}
                  {kycStatus === "Rejected" && "Your KYC was rejected. Please re-upload documents."}
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-muted-foreground">Aadhaar</span>
                  <span className="text-foreground font-medium">
                    {aadhaarFront && aadhaarBack ? "✓ Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-muted-foreground">PAN Card</span>
                  <span className="text-foreground font-medium">
                    {panCard ? "✓ Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-muted-foreground">Selfie</span>
                  <span className="text-foreground font-medium">
                    {selfie ? "✓ Uploaded" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-muted-foreground">Nominee</span>
                  <span className="text-foreground font-medium">
                    {nomineeName ? "✓ Added" : "Pending"}
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

