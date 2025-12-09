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
  PenTool 
} from "lucide-react";
import Toast from "@/components/Toast";

export default function KYCDetail({ params }) {
  const { id } = use(params); // Unwrap params
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState("");

  // Mock Detail Data
  const kycData = {
    id: id,
    status: "Pending",
    customer: {
      name: "Rahul Sharma",
      id: "KM-1001",
      email: "rahul@example.com",
      phone: "+91 98765 43210"
    },
    documents: [
      { name: "Aadhaar Front", type: "Image", size: "2.4 MB" },
      { name: "Aadhaar Back", type: "Image", size: "2.1 MB" },
      { name: "PAN Card", type: "PDF", size: "1.5 MB" }
    ],
    ocrData: {
      name: "Rahul Sharma",
      dob: "15/08/1990",
      aadhaarNo: "XXXX XXXX 1234",
      panNo: "ABCDE1234F",
      address: "B-404, Sterling City, Ahmedabad"
    },
    nominee: {
      name: "Anjali Sharma",
      relation: "Wife",
      dob: "10/02/1992"
    }
  };

  const handleAction = (action) => {
    if (action === "approve") setToast({ message: "KYC Approved Successfully", type: "success" });
    if (action === "reject") setToast({ message: "KYC Rejected", type: "error" }); // Error type uses destructive color in Toast
    if (action === "reupload") setToast({ message: "Re-upload request sent to customer", type: "success" });
  };

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
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2 shrink-0">
                    <button className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-background border border-input rounded-md hover:bg-muted transition-colors">Preview</button>
                    <button className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors">
                      <Download size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Preview */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
             <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <PenTool size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Signature</span>
            </h3>
            <div className="h-24 sm:h-28 md:h-32 bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
              [Signature Image Placeholder]
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Data Verification */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          
          {/* OCR Data Extraction */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-primary">
              <ScanLine size={16} className="sm:w-[18px] sm:h-[18px] shrink-0" /> <span>OCR Auto-Read Values</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Name on Card</p>
                <p className="font-medium mt-1 break-words">{kycData.ocrData.name}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">DOB</p>
                <p className="font-medium mt-1">{kycData.ocrData.dob}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Aadhaar No</p>
                <p className="font-medium mt-1 break-words">{kycData.ocrData.aadhaarNo}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">PAN No</p>
                <p className="font-medium mt-1 break-words">{kycData.ocrData.panNo}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Address</p>
                <p className="font-medium mt-1 break-words">{kycData.ocrData.address}</p>
              </div>
            </div>
          </div>

          {/* Nominee & Personal Info */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <User size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Personal & Nominee</span>
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-muted-foreground">Phone</label>
                  <input readOnly value={kycData.customer.phone} className="w-full bg-muted/50 border border-input rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs text-muted-foreground">Email</label>
                  <input readOnly value={kycData.customer.email} className="w-full bg-muted/50 border border-input rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm" />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs sm:text-sm font-medium mb-2">Nominee Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs text-muted-foreground">Name</label>
                    <input readOnly value={kycData.nominee.name} className="w-full bg-muted/50 border border-input rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs text-muted-foreground">Relation</label>
                    <input readOnly value={kycData.nominee.relation} className="w-full bg-muted/50 border border-input rounded px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

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
            onClick={() => handleAction('reupload')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-input bg-background hover:bg-muted rounded-md text-xs sm:text-sm font-medium transition-colors"
          >
            <RefreshCcw size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">Request Re-upload</span><span className="sm:hidden">Re-upload</span>
          </button>
          <button 
            onClick={() => handleAction('reject')}
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

    </div>
  );
}