"use client";
import { useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  FileText, 
  ScanLine, 
  User, 
  PenTool,
  X,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import Toast from "@/components/Toast";
import AdminKYCService from "@/services/admin/admin-kyc.service";
import { useEffect } from "react";

export default function KYCDetail({ params }) {
  const { id } = use(params); // Unwrap params
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [kycData, setKycData] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);

  // Fetch KYC details
  useEffect(() => {
    const fetchKYCDetails = async () => {
      setLoading(true);
      try {
        // Ensure ID is a valid number or string
        // Remove any non-numeric characters if it's a formatted ID like "KYC-2001"
        let kycId = id && id !== "N/A" ? String(id) : null;
        
        // If ID contains non-numeric characters, try to extract numeric part
        if (kycId && !/^\d+$/.test(kycId)) {
          // Extract numeric part from strings like "KYC-2001" or "2001"
          const numericMatch = kycId.match(/\d+/);
          if (numericMatch) {
            kycId = numericMatch[0];
          }
        }
        
        if (!kycId || kycId === "N/A") {
          setToast({ message: "Invalid KYC ID", type: "error" });
          setLoading(false);
          return;
        }

        console.log("Fetching KYC with ID:", kycId);
        const response = await AdminKYCService.getKYCById(kycId);

        // Debug: Log the response to understand structure
        console.log("KYC Detail Response:", response);

        // Handle different response structures
        let kyc = null;
        if (response.data) {
          kyc = response.data;
        } else if (response.kyc) {
          kyc = response.kyc;
        } else {
          kyc = response;
        }

        // Debug: Log the parsed KYC data
        console.log("Parsed KYC Data:", kyc);

        if (kyc) {
          // Separate selfie from other documents
          const allDocuments = kyc.documents || [];
          const selfieDoc = allDocuments.find(doc => 
            doc.name?.toLowerCase().includes("selfie") || 
            doc.name?.toLowerCase() === "selfie"
          );
          const otherDocuments = allDocuments.filter(doc => 
            !doc.name?.toLowerCase().includes("selfie") && 
            doc.name?.toLowerCase() !== "selfie"
          );

          setKycData({
            id: kyc.id || id,
            status: kyc.status || "Pending",
            customer: {
              name: kyc.customer?.name || kyc.customer?.fullName || kyc.fullName || "N/A",
              id: kyc.customer?.accountNumber || kyc.customer?.id || kyc.customerCode || kyc.accountNumber || "N/A",
              email: kyc.customer?.email || kyc.email || "N/A",
              phone: kyc.customer?.phone || kyc.customer?.mobile || kyc.mobile || "N/A"
            },
            documents: otherDocuments,
            selfie: selfieDoc || null,
            ocrData: {
              name: kyc.ocrData?.name || kyc.idNumber || kyc.name || "N/A",
              dob: kyc.ocrData?.dob || kyc.dob || "N/A",
              aadhaarNo: kyc.ocrData?.aadhaarNo || kyc.idNumber || "N/A",
              panNo: kyc.ocrData?.panNo || kyc.panNumber || "N/A",
              address: kyc.ocrData?.address || kyc.address || "N/A"
            },
            kycDetails: kyc.kycDetails || null,
            nominee: {
              name: kyc.nominee?.name || "N/A",
              relation: kyc.nominee?.relation || kyc.nominee?.relationship || "N/A",
              dob: kyc.nominee?.dob || "N/A",
              address: kyc.nominee?.address || "N/A",
              phone: kyc.nominee?.phone || "N/A"
            }
          });
        }
      } catch (error) {
        console.error("KYC Detail Error:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch KYC details";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchKYCDetails();
    }
  }, [id]);

  // Document mapping for API
  const getDocumentKey = (docName) => {
    const name = docName?.toLowerCase() || "";
    if (name.includes("aadhaar") && name.includes("front")) return "idFront";
    if (name.includes("aadhaar") && name.includes("back")) return "idBack";
    if (name.includes("pan")) return "panFile";
    if (name.includes("selfie")) return "selfie";
    return null;
  };

  // Get all available documents for selection
  const getAllDocuments = () => {
    const docs = [...(kycData?.documents || [])];
    if (kycData?.selfie) {
      docs.push(kycData.selfie);
    }
    return docs;
  };

  const toggleDocumentSelection = (docName) => {
    setSelectedDocuments(prev => 
      prev.includes(docName) 
        ? prev.filter(d => d !== docName)
        : [...prev, docName]
    );
  };

  const handleAction = async (action) => {
    // Ensure ID is valid
    const kycId = id && id !== "N/A" ? String(id) : null;
    if (!kycId) {
      setToast({ message: "Invalid KYC ID", type: "error" });
      return;
    }

    if (action === "approve") {
      if (!notes.trim()) {
        setToast({ message: "Please add notes before approving", type: "error" });
        return;
      }
      try {
        await AdminKYCService.updateKYCStatus(kycId, "approved", notes);
        setToast({ message: "KYC Approved Successfully", type: "success" });
        if (kycData) {
          setKycData({ ...kycData, status: "Approved" });
        }
        setNotes("");
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to approve KYC";
        setToast({ message: errorMessage, type: "error" });
      }
    }
    if (action === "reject") {
      if (!notes.trim()) {
        setToast({ message: "Please add notes before rejecting", type: "error" });
        return;
      }
      try {
        // Map selected documents to API format
        const documentsToReupload = selectedDocuments
          .map(doc => getDocumentKey(doc))
          .filter(Boolean);

        await AdminKYCService.updateKYCStatus(
          kycId, 
          "rejected", 
          notes,
          documentsToReupload.length > 0 ? documentsToReupload : undefined
        );
        setToast({ message: "KYC Rejected", type: "error" });
        if (kycData) {
          setKycData({ ...kycData, status: "Rejected" });
        }
        setNotes("");
        setSelectedDocuments([]);
        setShowDocumentSelector(false);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to reject KYC";
        setToast({ message: errorMessage, type: "error" });
      }
    }
    if (action === "reupload") {
      if (selectedDocuments.length === 0) {
        setToast({ message: "Please select at least one document to request re-upload", type: "error" });
        return;
      }
      try {
        // Map selected documents to API format
        const documentsToReupload = selectedDocuments
          .map(doc => getDocumentKey(doc))
          .filter(Boolean);

        await AdminKYCService.requestReupload(
          kycId, 
          documentsToReupload, 
          notes || "Please re-upload the selected documents with better quality."
        );
        setToast({ message: "Re-upload request sent to customer", type: "success" });
        setNotes("");
        setSelectedDocuments([]);
        setShowDocumentSelector(false);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to request re-upload";
        setToast({ message: errorMessage, type: "error" });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-24 sm:pb-28 md:pb-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading KYC details...</p>
        </div>
      </div>
    );
  }

  if (!kycData) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-24 sm:pb-28 md:pb-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">KYC not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-24 sm:pb-28 md:pb-20">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <Link href="/admin/kyc">
          <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">KYC Verification</h2>
            <span className="px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium bg-secondary text-secondary-foreground border border-secondary shrink-0">
              {kycData.status}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Review documents for {kycData.customer.name} ({kycData.customer.id})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        
        {/* LEFT COLUMN: Documents Viewer */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <FileText size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Uploaded Documents</span>
            </h3>
            
            <div className="space-y-2 sm:space-y-3">
              {kycData.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 bg-muted/30 border border-border rounded-lg group hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-background rounded-md flex items-center justify-center border border-border shrink-0">
                      <FileText size={16} className="sm:w-5 sm:h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm truncate">{doc.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{doc.type}{doc.size ? ` • ${doc.size}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2 shrink-0">
                    <button 
                      onClick={() => {
                        if (doc.url) {
                          setPreviewDocument(doc);
                          setImageZoom(1);
                        }
                      }}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-background border border-input rounded-md hover:bg-muted transition-colors"
                    >
                      Preview
                    </button>
                    <button 
                      onClick={async () => {
                        if (doc.url) {
                          try {
                            const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
                            const fullUrl = `${baseURL}${doc.url}`;
                            
                            // Fetch the file as blob
                            const response = await fetch(fullUrl);
                            const blob = await response.blob();
                            
                            // Create download link
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = doc.name || 'document';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Download failed:', error);
                            setToast({ message: "Failed to download document", type: "error" });
                          }
                        }
                      }}
                      className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    >
                      <Download size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selfie Preview */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
             <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <PenTool size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Selfie</span>
            </h3>
            {kycData.selfie ? (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 bg-muted/30 border border-border rounded-lg group hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-background rounded-md flex items-center justify-center border border-border shrink-0">
                      <FileText size={16} className="sm:w-5 sm:h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm truncate">{kycData.selfie.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{kycData.selfie.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2 shrink-0">
                    <button 
                      onClick={() => {
                        if (kycData.selfie?.url) {
                          const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
                          window.open(`${baseURL}${kycData.selfie.url}`, '_blank');
                        }
                      }}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-background border border-input rounded-md hover:bg-muted transition-colors"
                    >
                      Preview
                    </button>
                    <button 
                      onClick={async () => {
                        if (kycData.selfie?.url) {
                          try {
                            const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
                            const fullUrl = `${baseURL}${kycData.selfie.url}`;
                            
                            // Fetch the file as blob
                            const response = await fetch(fullUrl);
                            const blob = await response.blob();
                            
                            // Create download link
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = kycData.selfie.name || 'selfie';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Download failed:', error);
                            setToast({ message: "Failed to download selfie", type: "error" });
                          }
                        }
                      }}
                      className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    >
                      <Download size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                {kycData.selfie.url && (
                  <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${kycData.selfie.url}`}
                      alt="Selfie"
                      className="w-full h-auto max-h-64 sm:max-h-80 md:max-h-96 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="h-48 sm:h-64 md:h-80 bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-xs sm:text-sm" style={{ display: 'none' }}>
                      Failed to load image
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-24 sm:h-28 md:h-32 bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
                No selfie uploaded
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Data Verification */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          
          {/* OCR Data Extraction */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg flex items-center gap-1.5 sm:gap-2 text-primary">
                <ScanLine size={16} className="sm:w-[18px] sm:h-[18px] shrink-0" /> <span>OCR Auto-Read Values</span>
              </h3>
              {kycData.kycDetails && (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    {kycData.kycDetails.idType || "Aadhaar"} • {kycData.ocrData.name !== "N/A" ? "OCR Extracted" : "Pending"}
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Name on Card</p>
                <p className={`font-medium mt-1 wrap-break-word ${kycData.ocrData.name === "N/A" ? "text-muted-foreground italic" : ""}`}>
                  {kycData.ocrData.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">DOB</p>
                <p className={`font-medium mt-1 ${kycData.ocrData.dob === "N/A" ? "text-muted-foreground italic" : ""}`}>
                  {kycData.ocrData.dob}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Aadhaar No</p>
                <p className={`font-medium mt-1 wrap-break-word ${kycData.ocrData.aadhaarNo === "N/A" ? "text-muted-foreground italic" : ""}`}>
                  {kycData.ocrData.aadhaarNo}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">PAN No</p>
                <p className={`font-medium mt-1 wrap-break-word ${kycData.ocrData.panNo === "N/A" ? "text-muted-foreground italic" : ""}`}>
                  {kycData.ocrData.panNo}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Address</p>
                <p className={`font-medium mt-1 wrap-break-word ${kycData.ocrData.address === "N/A" ? "text-muted-foreground italic" : ""}`}>
                  {kycData.ocrData.address}
                </p>
              </div>
            </div>
            {kycData.kycDetails && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs">
                  <div>
                    <p className="text-muted-foreground">ID Type:</p>
                    <p className="font-medium">{kycData.kycDetails.idType || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ID Number:</p>
                    <p className="font-medium">{kycData.kycDetails.idNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">PAN Number:</p>
                    <p className="font-medium">{kycData.kycDetails.panNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted:</p>
                    <p className="font-medium">
                      {kycData.kycDetails.submittedAt 
                        ? new Date(kycData.kycDetails.submittedAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nominee & Personal Info */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <User size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Nominee Details</span>
            </h3>
            <div className="space-y-3 sm:space-y-4">
              
              <div className="pt-2 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs text-muted-foreground">Name</label>
                    <input readOnly value={kycData.nominee.name} className="w-full bg-muted/50 border border-input rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs text-muted-foreground">Relation</label>
                    <input readOnly value={kycData.nominee.relation} className="w-full bg-muted/50 border border-input rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs text-muted-foreground">Date of Birth</label>
                    <input readOnly value={kycData.nominee.dob} className="w-full bg-muted/50 border border-input rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs text-muted-foreground">Phone</label>
                    <input readOnly value={kycData.nominee.phone} className="w-full bg-muted/50 border border-input rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm" />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] sm:text-xs text-muted-foreground">Address</label>
                    <input readOnly value={kycData.nominee.address} className="w-full bg-muted/50 border border-input rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Selection for Re-upload */}
          {(showDocumentSelector || kycData?.status === "Pending") && (
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Select Documents to Re-upload</h3>
              <div className="space-y-2 sm:space-y-3">
                {getAllDocuments().map((doc, index) => (
                  <label key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.name)}
                      onChange={() => toggleDocumentSelection(doc.name)}
                      className="w-4 h-4 text-primary border-input rounded focus:ring-primary cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground">{doc.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowDocumentSelector(!showDocumentSelector);
                  if (showDocumentSelector) {
                    setSelectedDocuments([]);
                  }
                }}
                className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showDocumentSelector ? "Cancel Selection" : "Select Documents"}
              </button>
            </div>
          )}

          {/* Staff Notes */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-2">Staff Notes</h3>
            <textarea 
              className="w-full bg-background border border-input rounded-md p-2.5 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px] sm:min-h-[100px] resize-y"
              placeholder="Add verification notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

        </div>
      </div>

      {/* Action Footer (Sticky) */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-2.5 sm:p-3 md:p-4 bg-card border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 z-20 shadow-lg">
        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden md:block">Action required for verification</p>
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <button 
            onClick={() => {
              if (selectedDocuments.length > 0) {
                handleAction('reupload');
              } else {
                setShowDocumentSelector(true);
                setToast({ message: "Please select documents to request re-upload", type: "error" });
              }
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-input bg-background hover:bg-muted rounded-md text-xs sm:text-sm font-medium transition-colors"
          >
            <RefreshCcw size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">Request Re-upload</span><span className="sm:hidden">Re-upload</span>
          </button>
          <button 
            onClick={() => {
              // Allow reject with or without document selection
              handleAction('reject');
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-md text-xs sm:text-sm font-medium transition-colors"
          >
            <XCircle size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Reject</span>
          </button>
          <button 
            onClick={() => handleAction('approve')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md text-xs sm:text-sm font-medium transition-colors shadow-sm"
          >
            <CheckCircle2 size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">Approve KYC</span><span className="sm:hidden">Approve</span>
          </button>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewDocument(null)}
        >
          <div 
            className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                <h3 className="text-lg font-semibold">{previewDocument.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 border border-input rounded-md">
                  <button
                    onClick={() => setImageZoom(prev => Math.max(0.5, prev - 0.25))}
                    className="p-1.5 hover:bg-muted transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="px-2 text-xs text-muted-foreground min-w-[3rem] text-center">
                    {Math.round(imageZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setImageZoom(prev => Math.min(3, prev + 0.25))}
                    className="p-1.5 hover:bg-muted transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
                {/* Download Button */}
                {previewDocument.url && (
                  <button
                    onClick={async () => {
                      try {
                        const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
                        const fullUrl = `${baseURL}${previewDocument.url}`;
                        
                        // Fetch the file as blob
                        const response = await fetch(fullUrl);
                        const blob = await response.blob();
                        
                        // Create download link
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = previewDocument.name || 'document';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Download failed:', error);
                        setToast({ message: "Failed to download document", type: "error" });
                      }
                    }}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                )}
                {/* Close Button */}
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Image Preview */}
            <div className="flex-1 overflow-auto p-4 bg-muted/20 flex items-center justify-center">
              {previewDocument.url ? (
                <>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${previewDocument.url}`}
                    alt={previewDocument.name}
                    className="max-w-full max-h-[70vh] object-contain transition-transform duration-200"
                    style={{ transform: `scale(${imageZoom})` }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="hidden h-64 bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground">
                    Failed to load image
                  </div>
                </>
              ) : (
                <div className="h-64 bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground">
                  No preview available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}