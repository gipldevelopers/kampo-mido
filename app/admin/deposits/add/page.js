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
    <div className="space-y-6 animate-in fade-in duration-500 w-full relative">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/deposits">
          <button className="p-2 hover:bg-card border border-border rounded-full transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Add New Deposit</h2>
          <p className="text-sm text-muted-foreground">Manually record a UPI payment and convert to gold.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Customer</label>
              <div className="relative">
                <select className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer">
                  <option value="">-- Choose Customer --</option>
                  <option value="1">Rahul Sharma (KM-1001)</option>
                  <option value="2">Priya Singh (KM-1002)</option>
                  <option value="3">Amit Kumar (KM-1003)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={16} className="text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Deposit Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                  placeholder="e.g. 50000" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment Mode</label>
                <input 
                  type="text" 
                  value="UPI" 
                  readOnly
                  className="w-full px-3 py-2 bg-muted border border-input rounded-md text-muted-foreground cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">UPI Reference No.</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                  placeholder="Txn ID from payment app" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date & Time</label>
                <input 
                  type="datetime-local" 
                  defaultValue={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Admin Notes</label>
              <textarea 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px]"
                placeholder="Optional notes..."
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Link href="/admin/deposits">
                <button type="button" className="px-4 py-2 border border-input bg-transparent rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
              </Link>
              <button 
                type="submit" 
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                <Save size={16} /> Process Deposit
              </button>
            </div>

          </form>
        </div>

        {/* Right: Live Calculation Preview */}
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-primary" /> Conversion Preview
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Current Gold Rate:</span>
                <span className="font-medium text-foreground">₹ {goldRate} /g</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Deposit Amount:</span>
                <span className="font-medium text-foreground">₹ {amount || 0}</span>
              </div>

              <div className="pt-4 border-t border-primary/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estimated Gold Credit</p>
                <p className="text-3xl font-bold text-primary">{calculatedGold} g</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-xl p-6 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Important Note:</p>
            <p>Ensure the UPI transaction is verified in your banking app before proceeding. This action will immediately credit the customer&apos;s wallet.</p>
          </div>
        </div>

      </div>
    </div>
  );
}