"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, ChevronDown, Calculator, AlertTriangle, Loader2 } from "lucide-react";
import Toast from "@/components/Toast";
import DepositService from "@/services/admin/deposit.service";

export default function EditDeposit({ params }) {
  // Unwrap params
  const { id } = use(params);
  
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    customer: "",
    customerName: "",
    amount: "",
    mode: "UPI",
    upiRef: "",
    date: "",
    notes: "",
    goldRate: 0 // The rate locked at the time of deposit
  });

  const [calculatedGold, setCalculatedGold] = useState(0);

  // Fetch deposit data on mount
  useEffect(() => {
    const fetchDeposit = async () => {
      if (!id) return;
      
      setFetching(true);
      try {
        // Extract numeric ID from transactionId format (e.g., "DEP-1" -> 1)
        // or use the ID directly if it's already numeric
        let numericId = id;
        if (typeof id === 'string' && id.startsWith('DEP-')) {
          const extractedId = id.replace('DEP-', '');
          numericId = extractedId;
        }
        
        const response = await DepositService.getDepositById(numericId);
        
        // Handle different response structures
        const deposit = response.data || response;
        
        if (deposit) {
          // Format date for datetime-local input
          let formattedDate = "";
          if (deposit.depositDate || deposit.date || deposit.createdAt) {
            try {
              const date = new Date(deposit.depositDate || deposit.date || deposit.createdAt);
              formattedDate = date.toISOString().slice(0, 16);
            } catch (error) {
              console.error("Error formatting date:", error);
            }
          }
          
          setFormData({
            customer: deposit.customer?.id || deposit.customerId || "",
            customerName: deposit.customer?.name || deposit.customerName || "",
            amount: deposit.amount?.toString() || "",
            mode: deposit.mode || "UPI",
            upiRef: deposit.upiReference || deposit.upiRef || "",
            date: formattedDate,
            notes: deposit.adminNotes || deposit.notes || "",
            goldRate: deposit.rateUsed || deposit.rate || 0
          });
        }
      } catch (error) {
        console.error("Error fetching deposit:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch deposit";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setFetching(false);
      }
    };

    fetchDeposit();
  }, [id]);

  // Calculate gold when amount or rate changes
  useEffect(() => {
    if (formData.amount && !isNaN(formData.amount) && formData.goldRate && formData.goldRate > 0) {
      const gold = (parseFloat(formData.amount) / formData.goldRate).toFixed(4);
      setCalculatedGold(gold);
    } else {
      setCalculatedGold(0);
    }
  }, [formData.amount, formData.goldRate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if(!formData.amount || formData.amount <= 0) {
      setToast({ message: "Please enter a valid amount", type: "error" });
      return;
    }
    
    setLoading(true);
    try {
      // Format date to ISO string
      let depositDate = "";
      if (formData.date) {
        try {
          const date = new Date(formData.date);
          depositDate = date.toISOString();
        } catch (error) {
          console.error("Error formatting date:", error);
          setToast({ message: "Invalid date format", type: "error" });
          setLoading(false);
          return;
        }
      }
      
      // Extract numeric ID from transactionId format (e.g., "DEP-1" -> 1)
      // or use the ID directly if it's already numeric
      let numericId = id;
      if (typeof id === 'string' && id.startsWith('DEP-')) {
        const extractedId = id.replace('DEP-', '');
        numericId = extractedId;
      }
      
      const updateData = {
        amount: parseFloat(formData.amount),
        upiReference: formData.upiRef || "",
        depositDate: depositDate,
        adminNotes: formData.notes || ""
      };
      
      await DepositService.updateDeposit(numericId, updateData);
      setToast({ message: "Deposit details updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating deposit:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update deposit";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative">
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <Link href="/admin/deposits">
          <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Edit Deposit</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Modify transaction details for ID: {id}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        
        {/* Left: Edit Form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
          <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-5 md:space-y-6">
            
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">Customer (Read-Only)</label>
              <div className="relative">
                {fetching ? (
                  <div className="w-full px-3 py-2 sm:py-2.5 bg-muted border border-input rounded-md text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.customerName || "N/A"}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 sm:py-2.5 bg-muted border border-input rounded-md text-sm text-muted-foreground cursor-not-allowed"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Deposit Amount (₹)</label>
                <input 
                  type="number" 
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Payment Mode</label>
                <input 
                  type="text" 
                  value={formData.mode} 
                  readOnly
                  className="w-full px-3 py-2 sm:py-2.5 bg-muted border border-input rounded-md text-sm text-muted-foreground cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">UPI Reference No.</label>
                <input 
                  type="text" 
                  name="upiRef"
                  value={formData.upiRef}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">Admin Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y"
              ></textarea>
            </div>

            <div className="pt-2 sm:pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <Link href="/admin/deposits" className="w-full sm:w-auto">
                <button type="button" className="w-full sm:w-auto px-4 py-2 sm:py-2.5 border border-input bg-transparent rounded-md text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
              </Link>
              <button 
                type="submit" 
                disabled={loading || fetching}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="sm:w-4 sm:h-4 shrink-0 animate-spin" /> <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Update Deposit</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right: Info & Warning */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          
          {/* Conversion Details */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <Calculator size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Conversion Details</span>
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-muted-foreground">Locked Gold Rate:</span>
                <span className="font-medium text-foreground break-words">₹ {formData.goldRate} /g</span>
              </div>
              
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-muted-foreground">Deposit Amount:</span>
                <span className="font-medium text-foreground break-words">₹ {formData.amount || 0}</span>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-border">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-1">Gold Credited</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary break-words">{calculatedGold} g</p>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-xs sm:text-sm">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="mb-2 font-medium text-destructive">Critical Warning</p>
                <p className="text-muted-foreground leading-relaxed break-words">
                  Changing the <strong>Amount</strong> will recalculate the gold grams based on the <strong>original locked rate</strong> (₹{formData.goldRate}).
                  <br/><br/>
                  This will modify the customer&apos;s ledger balance and wallet history. Proceed with caution.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}