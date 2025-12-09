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
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-24 sm:pb-28 md:pb-20">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <Link href="/admin/withdrawals">
          <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Withdrawal Request</h2>
            <span className={`px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border shrink-0 ${
              request.status === 'Pending' ? 'bg-secondary text-secondary-foreground border-secondary' :
              request.status === 'Approved' ? 'bg-primary/10 text-primary border-primary/20' :
              request.status === 'Completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
              'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {request.status}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Request ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        
        {/* Left: Request Details */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <PackageCheck size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Request Details</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 text-xs sm:text-sm">
              <div className="p-2.5 sm:p-3 bg-muted/30 rounded-md border border-border">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                <p className="font-medium mt-1 break-words">{request.type}</p>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/30 rounded-md border border-border">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="font-medium mt-1 break-words">{request.requestDate}</p>
              </div>
              <div className="p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-md">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Weight</p>
                <p className="font-bold text-base sm:text-lg text-primary mt-1 break-words">{request.grams.toFixed(2)} g</p>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/30 rounded-md border border-border">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Est. Value</p>
                <p className="font-medium mt-1 text-base sm:text-lg break-words">₹ {request.value.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
              <p className="text-xs sm:text-sm font-medium mb-2 text-muted-foreground">Delivery/Payment Details</p>
              {request.type === "Money" ? (
                <div className="bg-muted/50 p-2.5 sm:p-3 rounded text-xs sm:text-sm space-y-1">
                  <p><strong>Bank:</strong> HDFC Bank</p>
                  <p><strong>Account:</strong> {request.bankDetails.account}</p>
                  <p><strong>IFSC:</strong> {request.bankDetails.ifsc}</p>
                </div>
              ) : (
                <div className="bg-muted/50 p-2.5 sm:p-3 rounded text-xs sm:text-sm">
                  <p className="text-muted-foreground mb-1">Delivery Address:</p>
                  <p className="break-words">{request.address}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Admin Notes</h3>
            <textarea 
              className="w-full bg-background border border-input rounded-md p-2.5 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px] sm:min-h-[100px] resize-y"
              placeholder="Add notes about delivery status or transaction ID..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Right: Customer & Wallet Check */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <User size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Customer Info</span>
            </h3>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-full flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
                {request.customer.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs sm:text-sm md:text-base truncate">{request.customer.name}</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">{request.customer.id}</p>
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <p><span className="text-muted-foreground">Phone:</span> <span className="break-words">{request.customer.phone}</span></p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <Wallet size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Wallet Check</span>
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-muted/30 rounded-md">
                <span className="text-xs sm:text-sm text-muted-foreground">Current Gold Balance</span>
                <span className="font-medium text-xs sm:text-sm break-words">{request.customer.walletBalance.toFixed(2)} g</span>
              </div>
              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-muted/30 rounded-md">
                <span className="text-xs sm:text-sm text-muted-foreground">Requested Withdrawal</span>
                <span className="font-medium text-xs sm:text-sm text-destructive break-words">-{request.grams.toFixed(2)} g</span>
              </div>
              
              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-md">
                <span className="text-xs sm:text-sm font-medium">Balance After Withdrawal</span>
                <span className={`font-bold text-xs sm:text-sm break-words ${request.customer.walletBalance - request.grams < 0 ? 'text-destructive' : 'text-primary'}`}>
                  {(request.customer.walletBalance - request.grams).toFixed(2)} g
                </span>
              </div>

              {request.customer.walletBalance < request.grams && (
                <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-destructive/10 text-destructive text-xs sm:text-sm rounded-md border border-destructive/20">
                  <AlertTriangle size={14} className="sm:w-4 sm:h-4 mt-0.5 shrink-0" />
                  <p className="break-words">Insufficient balance! This request cannot be processed safely.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Action Footer (Sticky) */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-2.5 sm:p-3 md:p-4 bg-card border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 z-20 shadow-lg">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden sm:flex">
          <Clock size={12} className="sm:w-3.5 sm:h-3.5" /> <span>Request created 2 hours ago</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {request.status === "Pending" && (
            <>
              <button 
                onClick={() => handleAction('reject')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-md text-xs sm:text-sm font-medium transition-colors"
              >
                <XCircle size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Reject</span>
              </button>
              <button 
                onClick={() => handleAction('approve')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md text-xs sm:text-sm font-medium transition-colors shadow-sm"
              >
                <CheckCircle2 size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">Approve Request</span><span className="sm:hidden">Approve</span>
              </button>
            </>
          )}
          
          {request.status === "Approved" && (
            <button 
              onClick={() => handleAction('complete')}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-green-600 text-white hover:bg-green-700 rounded-md text-xs sm:text-sm font-medium transition-colors shadow-sm"
            >
              <PackageCheck size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">Mark Completed (Delivered/Paid)</span><span className="sm:hidden">Mark Completed</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}