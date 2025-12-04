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
    <div className="space-y-6 animate-in fade-in duration-500 w-full relative pb-20">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/kyc">
          <button className="p-2 hover:bg-card border border-border rounded-full transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">KYC Verification</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-secondary">
              {kycData.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Review documents for {kycData.customer.name} ({kycData.customer.id})</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Documents Viewer */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" /> Uploaded Documents
            </h3>
            
            <div className="space-y-3">
              {kycData.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg group hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background rounded-md flex items-center justify-center border border-border">
                      <FileText size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium bg-background border border-input rounded-md hover:bg-muted transition-colors">Preview</button>
                    <button className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Preview */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <PenTool size={18} className="text-primary" /> Signature
            </h3>
            <div className="h-32 bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
              [Signature Image Placeholder]
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Data Verification */}
        <div className="space-y-6">
          
          {/* OCR Data Extraction */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-primary">
              <ScanLine size={18} /> OCR Auto-Read Values
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Name on Card</p>
                <p className="font-medium mt-1">{kycData.ocrData.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">DOB</p>
                <p className="font-medium mt-1">{kycData.ocrData.dob}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Aadhaar No</p>
                <p className="font-medium mt-1">{kycData.ocrData.aadhaarNo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">PAN No</p>
                <p className="font-medium mt-1">{kycData.ocrData.panNo}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Address</p>
                <p className="font-medium mt-1">{kycData.ocrData.address}</p>
              </div>
            </div>
          </div>

          {/* Nominee & Personal Info */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User size={18} className="text-primary" /> Personal & Nominee
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Phone</label>
                  <input readOnly value={kycData.customer.phone} className="w-full bg-muted/50 border border-input rounded px-3 py-1.5 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <input readOnly value={kycData.customer.email} className="w-full bg-muted/50 border border-input rounded px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium mb-2">Nominee Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Name</label>
                    <input readOnly value={kycData.nominee.name} className="w-full bg-muted/50 border border-input rounded px-3 py-1.5 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Relation</label>
                    <input readOnly value={kycData.nominee.relation} className="w-full bg-muted/50 border border-input rounded px-3 py-1.5 text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Notes */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Staff Notes</h3>
            <textarea 
              className="w-full bg-background border border-input rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
              placeholder="Add verification notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

        </div>
      </div>

      {/* Action Footer (Sticky) */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-card border-t border-border flex items-center justify-between z-20 shadow-lg">
        <p className="text-sm text-muted-foreground hidden md:block">Action required for verification</p>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => handleAction('reupload')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background hover:bg-muted rounded-md text-sm font-medium transition-colors"
          >
            <RefreshCcw size={16} /> Request Re-upload
          </button>
          <button 
            onClick={() => handleAction('reject')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-md text-sm font-medium transition-colors"
          >
            <XCircle size={16} /> Reject
          </button>
          <button 
            onClick={() => handleAction('approve')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            <CheckCircle2 size={16} /> Approve KYC
          </button>
        </div>
      </div>

    </div>
  );
}