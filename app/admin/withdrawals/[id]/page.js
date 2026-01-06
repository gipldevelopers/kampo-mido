"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation"; // Import useParams
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  PackageCheck,
  User,
  Wallet,
  AlertTriangle,
  Clock,
  Loader2
} from "lucide-react";
import Toast from "@/components/Toast";
import withdrawalRequestService from "../../../../services/admin/withdrawal-request.service";
import GoldRateService from "../../../../services/admin/gold-rate.service";

export default function WithdrawalDetail() {
  const params = useParams(); // Use useParams hook
  const id = params.id; // Get id from params

  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // State for withdrawal request
  const [request, setRequest] = useState({
    id: id || "",
    withdrawalId: id || "",
    customer: { name: "", id: "", phone: "", walletBalance: 0 },
    type: "",
    typeDisplay: "",
    grams: 0,
    amount: 0,
    value: 0,
    requestDate: "",
    status: "",
    statusDisplay: "",
    bankDetails: { account: "", ifsc: "", bank: "" },
    address: "",
    timeAgo: "",
    hasInsufficientBalance: false,
    balanceAfterWithdrawal: 0
  });

  const [currentGoldRate, setCurrentGoldRate] = useState(0);

  // Fetch withdrawal details and gold rate
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        setLoading(true);

        // Fetch current gold rate
        try {
          const rateResponse = await GoldRateService.getCurrentRate();
          if (rateResponse.success && rateResponse.data) {
            const rate = parseFloat(rateResponse.data.ratePerGram);
            setCurrentGoldRate(rate);
            console.log("Current Gold Rate fetched:", rate);
          }
        } catch (rateError) {
          console.error("Error fetching gold rate:", rateError);
        }

        const response = await withdrawalRequestService.getWithdrawalById(id);

        if (response.success) {
          const data = response.data;
          setRequest({
            id: data.id,
            withdrawalId: data.withdrawalId,
            customer: {
              name: data.customer.name,
              id: data.customer.id,
              phone: data.customer.phone,
              walletBalance: data.customer.walletBalance
            },
            type: data.type,
            typeDisplay: data.typeDisplay,
            grams: data.grams || 0,
            amount: data.amount || 0,
            value: data.value || 0,
            requestDate: data.requestDate,
            status: data.status,
            statusDisplay: data.statusDisplay,
            bankDetails: data.bankDetails || { account: "", ifsc: "", bank: "" },
            address: data.address || "",
            timeAgo: data.timeAgo,
            hasInsufficientBalance: data.hasInsufficientBalance,
            balanceAfterWithdrawal: data.balanceAfterWithdrawal
          });
        }
      } catch (error) {
        console.error("Error fetching withdrawal details:", error);
        setToast({
          message: error.response?.data?.message || "Failed to load withdrawal details",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Recalculate grams if it's a money withdrawal and we have a gold rate
  useEffect(() => {
    // We calculate if it's money type AND (grams is not set OR it's 0) AND we have rate/amount
    const shouldCalculate = request.type === "money" && (!request.grams || request.grams === 0);

    if (shouldCalculate && currentGoldRate > 0 && request.amount > 0) {
      const calculatedGrams = parseFloat(request.amount) / currentGoldRate;
      const balanceAfter = parseFloat(request.customer.walletBalance) - calculatedGrams;

      console.log("Calculating grams for money withdrawal:", { amount: request.amount, rate: currentGoldRate, grams: calculatedGrams });

      setRequest(prev => ({
        ...prev,
        grams: calculatedGrams,
        balanceAfterWithdrawal: balanceAfter,
        hasInsufficientBalance: balanceAfter < 0
      }));
    }
  }, [currentGoldRate, request.type, request.amount, request.grams, request.customer.walletBalance]);

  const handleAction = async (action) => {
    try {
      setProcessing(true);

      if (action === "approve") {
        // Prepare payload for approval
        const approvalData = {
          status: 'approved',
          adminNotes: notes,
          // Explicitly pass grams for money withdrawals to ensure backend records it
          grams: request.grams
        };

        const response = await withdrawalRequestService.updateWithdrawalStatus(id, approvalData);

        if (response.success) {
          setRequest(prev => ({ ...prev, status: "approved", statusDisplay: "Approved" }));
          setToast({ message: "Request Approved and Gold Deducted successfully.", type: "success" });

          // Note: Automatic completion removed to avoid "must be approved before marking as completed" 500 error.
          // The admin can now click "Mark Completed" after the status refresh.
        }
      }

      if (action === "complete") {
        const response = await withdrawalRequestService.completeWithdrawal(id, {
          notes: notes
        });
        if (response.success) {
          setRequest(prev => ({ ...prev, status: "completed", statusDisplay: "Completed" }));
          setToast({ message: "Request Marked as Completed (Delivered/Paid).", type: "success" });
        }
      }

      if (action === "reject") {
        const response = await withdrawalRequestService.updateWithdrawalStatus(id, {
          status: 'rejected',
          adminNotes: notes
        });
        if (response.success) {
          setRequest(prev => ({ ...prev, status: "rejected", statusDisplay: "Rejected" }));
          setToast({ message: "Request Rejected.", type: "error" });
        }
      }

      // Save notes if any
      if (notes.trim()) {
        await withdrawalRequestService.addAdminNotes(id, {
          notes: notes
        });
        setNotes("");
      }

    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      setToast({
        message: error.response?.data?.message || `Failed to ${action} withdrawal`,
        type: "error"
      });
    } finally {
      setProcessing(false);
    }
  };

  const saveNotes = async () => {
    try {
      if (notes.trim()) {
        await withdrawalRequestService.addAdminNotes(id, {
          notes: notes
        });
        setToast({
          message: "Notes saved successfully",
          type: "success"
        });
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      setToast({
        message: error.response?.data?.message || "Failed to save notes",
        type: "error"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading withdrawal details...</p>
        </div>
      </div>
    );
  }

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
            <span className={`px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border shrink-0 ${request.status === 'pending' ? 'bg-secondary text-secondary-foreground border-secondary' :
              request.status === 'approved' ? 'bg-primary/10 text-primary border-primary/20' :
                request.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                  'bg-destructive/10 text-destructive border-destructive/20'
              }`}>
              {request.statusDisplay}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Request ID: {request.withdrawalId}</p>
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
                <p className="font-medium mt-1 break-words">{request.typeDisplay}</p>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/30 rounded-md border border-border">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="font-medium mt-1 break-words">{request.requestDate}</p>
              </div>
              <div className="p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-md">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Weight</p>
                <p className="font-bold text-base sm:text-lg text-primary mt-1 break-words">
                  {request.grams ? `${request.grams.toFixed(2)} g` : 'N/A'}
                </p>
              </div>
              <div className="p-2.5 sm:p-3 bg-muted/30 rounded-md border border-border">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Est. Value</p>
                <p className="font-medium mt-1 text-base sm:text-lg break-words">
                  {request.value ? `₹ ${request.value.toLocaleString()}` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
              <p className="text-xs sm:text-sm font-medium mb-2 text-muted-foreground">Delivery/Payment Details</p>
              {request.type === "money" ? (
                <div className="bg-muted/50 p-2.5 sm:p-3 rounded text-xs sm:text-sm space-y-1">
                  <p><strong>Bank:</strong> {request.bankDetails.bank || 'Not specified'}</p>
                  <p><strong>Account:</strong> {request.bankDetails.account || 'XXXX1234'}</p>
                  <p><strong>IFSC:</strong> {request.bankDetails.ifsc || 'HDFC0001234'}</p>
                </div>
              ) : (
                <div className="bg-muted/50 p-2.5 sm:p-3 rounded text-xs sm:text-sm">
                  <p className="text-muted-foreground mb-1">Delivery Address:</p>
                  <p className="break-words">{request.address || 'No address provided'}</p>
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
              onBlur={saveNotes}
            ></textarea>
            <p className="text-[10px] text-muted-foreground mt-1.5">Notes are saved automatically when you click outside the textarea.</p>
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
                {request.customer.name ? request.customer.name.charAt(0) : '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs sm:text-sm md:text-base truncate">{request.customer.name || 'N/A'}</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">{request.customer.id || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <p><span className="text-muted-foreground">Phone:</span> <span className="break-words">{request.customer.phone || 'N/A'}</span></p>
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
                <span className="font-medium text-xs sm:text-sm text-destructive break-words">-{request.grams ? request.grams.toFixed(2) : '0.00'} g</span>
              </div>

              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-md">
                <span className="text-xs sm:text-sm font-medium">Balance After Withdrawal</span>
                <span className={`font-bold text-xs sm:text-sm break-words ${request.hasInsufficientBalance ? 'text-destructive' : 'text-primary'}`}>
                  {request.balanceAfterWithdrawal.toFixed(2)} g
                </span>
              </div>

              {request.hasInsufficientBalance && (
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
          <Clock size={12} className="sm:w-3.5 sm:h-3.5" /> <span>Request created {request.timeAgo || 'recently'}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {processing && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}

          {request.status === "pending" && !processing && (
            <>
              <button
                onClick={() => handleAction('reject')}
                disabled={processing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Reject</span>
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={processing || request.hasInsufficientBalance}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md text-xs sm:text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={14} className="sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">
                  {request.hasInsufficientBalance ? 'Insufficient Balance' : 'Approve Request'}
                </span>
                <span className="sm:hidden">Approve</span>
              </button>
            </>
          )}

          {request.status === "approved" && !processing && (
            <button
              onClick={() => handleAction('complete')}
              disabled={processing}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-green-600 text-white hover:bg-green-700 rounded-md text-xs sm:text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PackageCheck size={14} className="sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Mark Completed (Delivered/Paid)</span>
              <span className="sm:hidden">Mark Completed</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}