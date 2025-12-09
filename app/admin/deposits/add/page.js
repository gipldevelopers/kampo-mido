"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, ChevronDown, Calculator } from "lucide-react";
import Toast from "@/components/Toast";

export default function AddDeposit() {
  const [toast, setToast] = useState(null);
  
  // Form State
  const [amount, setAmount] = useState("");
  const [goldRate] = useState(7645); // This would come from your global state/API
  const [calculatedGold, setCalculatedGold] = useState(0);

  // FIX: Wrapped logic in setTimeout to avoid synchronous state update error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && !isNaN(amount)) {
        const gold = (parseFloat(amount) / goldRate).toFixed(4);
        setCalculatedGold(gold);
      } else {
        setCalculatedGold(0);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [amount, goldRate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!amount || amount <= 0) {
      setToast({ message: "Please enter a valid amount", type: "error" });
      return;
    }
    
    // Simulate API calls
    setToast({ message: "Deposit processed & Gold credited!", type: "success" });
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <Link href="/admin/deposits">
          <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Add New Deposit</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Manually record a UPI payment and convert to gold.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">Select Customer</label>
              <div className="relative">
                <select className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer">
                  <option value="">-- Choose Customer --</option>
                  <option value="1">Rahul Sharma (KM-1001)</option>
                  <option value="2">Priya Singh (KM-1002)</option>
                  <option value="3">Amit Kumar (KM-1003)</option>
                </select>
                <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={14} className="sm:w-4 sm:h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Deposit Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                  placeholder="e.g. 50000" 
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Payment Mode</label>
                <input 
                  type="text" 
                  value="UPI" 
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
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                  placeholder="Txn ID from payment app" 
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Date & Time</label>
                <input 
                  type="datetime-local" 
                  defaultValue={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">Admin Notes</label>
              <textarea 
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y"
                placeholder="Optional notes..."
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
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                <Save size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Process Deposit</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right: Live Calculation Preview */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <Calculator size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Conversion Preview</span>
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-muted-foreground">Current Gold Rate:</span>
                <span className="font-medium text-foreground break-words">₹ {goldRate} /g</span>
              </div>
              
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-muted-foreground">Deposit Amount:</span>
                <span className="font-medium text-foreground break-words">₹ {amount || 0}</span>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-primary/20">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-1">Estimated Gold Credit</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary break-words">{calculatedGold} g</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-xs sm:text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Important Note:</p>
            <p className="break-words">Ensure the UPI transaction is verified in your banking app before proceeding. This action will immediately credit the customer&apos;s wallet.</p>
          </div>
        </div>

      </div>
    </div>
  );
}