"use client";
import { useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  PackageCheck,
  User, 
  Wallet,
  AlertTriangle,
  Clock
} from "lucide-react";
import Toast from "@/components/Toast";

export default function WithdrawalDetail({ params }) {
  const { id } = use(params);
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState("");
  
  // Mock Data for a single request
  const [request, setRequest] = useState({
    id: id,
    customer: { name: "Rahul Sharma", id: "KM-1001", phone: "+91 98765 43210", walletBalance: 12.5 },
    type: "Physical Gold",
    grams: 10.00,
    value: 76450,
    requestDate: "02 Dec 2024, 11:00 AM",
    status: "Pending", // Pending, Approved, Completed, Rejected
    bankDetails: { account: "XXXX1234", ifsc: "HDFC0001234" }, // Only relevant for Money type
    address: "B-404, Sterling City, Bopal, Ahmedabad" // Relevant for Physical/Jewellery
  });

  const handleAction = (action) => {
    if (action === "approve") {
      setRequest(prev => ({ ...prev, status: "Approved" }));
      setToast({ message: "Request Approved. Ready for processing.", type: "success" });
    }
    if (action === "complete") {
      setRequest(prev => ({ ...prev, status: "Completed" }));
      setToast({ message: "Request Marked as Completed (Delivered/Paid).", type: "success" });
    }
    if (action === "reject") {
      setRequest(prev => ({ ...prev, status: "Rejected" }));
      setToast({ message: "Request Rejected. Gold refunded to wallet.", type: "error" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full relative pb-20">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/withdrawals">
          <button className="p-2 hover:bg-card border border-border rounded-full transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Withdrawal Request</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              request.status === 'Pending' ? 'bg-secondary text-secondary-foreground border-secondary' :
              request.status === 'Approved' ? 'bg-primary/10 text-primary border-primary/20' :
              request.status === 'Completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
              'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {request.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Request ID: {id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Left: Request Details */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <PackageCheck size={18} className="text-primary" /> Request Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted/30 rounded-md border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                <p className="font-medium mt-1">{request.type}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-md border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="font-medium mt-1">{request.requestDate}</p>
              </div>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Weight</p>
                <p className="font-bold text-lg text-primary mt-1">{request.grams.toFixed(2)} g</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-md border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Est. Value</p>
                <p className="font-medium mt-1 text-lg">₹ {request.value.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium mb-2 text-muted-foreground">Delivery/Payment Details</p>
              {request.type === "Money" ? (
                <div className="bg-muted/50 p-3 rounded text-sm space-y-1">
                  <p><strong>Bank:</strong> HDFC Bank</p>
                  <p><strong>Account:</strong> {request.bankDetails.account}</p>
                  <p><strong>IFSC:</strong> {request.bankDetails.ifsc}</p>
                </div>
              ) : (
                <div className="bg-muted/50 p-3 rounded text-sm">
                  <p className="text-muted-foreground mb-1">Delivery Address:</p>
                  <p>{request.address}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Admin Notes</h3>
            <textarea 
              className="w-full bg-background border border-input rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
              placeholder="Add notes about delivery status or transaction ID..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Right: Customer & Wallet Check */}
        <div className="space-y-6">
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User size={18} className="text-primary" /> Customer Info
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-lg font-bold">
                {request.customer.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{request.customer.name}</p>
                <p className="text-sm text-muted-foreground">{request.customer.id}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Phone:</span> {request.customer.phone}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Wallet size={18} className="text-primary" /> Wallet Check
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                <span className="text-sm text-muted-foreground">Current Gold Balance</span>
                <span className="font-medium">{request.customer.walletBalance.toFixed(2)} g</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                <span className="text-sm text-muted-foreground">Requested Withdrawal</span>
                <span className="font-medium text-destructive">-{request.grams.toFixed(2)} g</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-primary/5 border border-primary/20 rounded-md">
                <span className="text-sm font-medium">Balance After Withdrawal</span>
                <span className={`font-bold ${request.customer.walletBalance - request.grams < 0 ? 'text-destructive' : 'text-primary'}`}>
                  {(request.customer.walletBalance - request.grams).toFixed(2)} g
                </span>
              </div>

              {request.customer.walletBalance < request.grams && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <p>Insufficient balance! This request cannot be processed safely.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Action Footer (Sticky) */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-card border-t border-border flex items-center justify-between z-20 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground hidden sm:flex">
          <Clock size={14} /> Request created 2 hours ago
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {request.status === "Pending" && (
            <>
              <button 
                onClick={() => handleAction('reject')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-md text-sm font-medium transition-colors"
              >
                <XCircle size={16} /> Reject
              </button>
              <button 
                onClick={() => handleAction('approve')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                <CheckCircle2 size={16} /> Approve Request
              </button>
            </>
          )}
          
          {request.status === "Approved" && (
            <button 
              onClick={() => handleAction('complete')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              <PackageCheck size={16} /> Mark Completed (Delivered/Paid)
            </button>
          )}
        </div>
      </div>

    </div>
  );
}