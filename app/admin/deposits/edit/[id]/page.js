"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, ChevronDown, Calculator, AlertTriangle } from "lucide-react";
import Toast from "@/components/Toast";

export default function EditDeposit({ params }) {
  // Unwrap params
  const { id } = use(params);
  
  const [toast, setToast] = useState(null);
  
  // Mock State representing the existing data fetched from DB
  const [formData, setFormData] = useState({
    customer: "1", // Rahul Sharma
    amount: "25000",
    mode: "UPI",
    upiRef: "UPI-1234567890",
    date: "2024-12-02T10:23", // Format for datetime-local
    notes: "Verified via banking app",
    goldRate: 7645 // The rate locked at the time of deposit
  });

  const [calculatedGold, setCalculatedGold] = useState(0);

  // FIX: Wrapped logic in setTimeout to avoid synchronous state update error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.amount && !isNaN(formData.amount)) {
        const gold = (parseFloat(formData.amount) / formData.goldRate).toFixed(4);
        setCalculatedGold(gold);
      } else {
        setCalculatedGold(0);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [formData.amount, formData.goldRate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if(!formData.amount || formData.amount <= 0) {
      setToast({ message: "Please enter a valid amount", type: "error" });
      return;
    }
    
    // Simulate API Update
    setToast({ message: "Deposit details updated successfully!", type: "success" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full relative">
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/deposits">
          <button className="p-2 hover:bg-card border border-border rounded-full transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Deposit</h2>
          <p className="text-sm text-muted-foreground">Modify transaction details for ID: {id}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left: Edit Form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleUpdate} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Customer (Read-Only)</label>
              <div className="relative">
                <select 
                  name="customer"
                  value={formData.customer}
                  disabled
                  className="w-full px-3 py-2 bg-muted border border-input rounded-md text-muted-foreground appearance-none cursor-not-allowed focus:outline-none"
                >
                  <option value="1">Rahul Sharma (KM-1001)</option>
                  <option value="2">Priya Singh (KM-1002)</option>
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
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment Mode</label>
                <input 
                  type="text" 
                  value={formData.mode} 
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
                  name="upiRef"
                  value={formData.upiRef}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Admin Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px]"
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
                <Save size={16} /> Update Deposit
              </button>
            </div>

          </form>
        </div>

        {/* Right: Info & Warning */}
        <div className="space-y-6">
          
          {/* Conversion Details */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-primary" /> Conversion Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Locked Gold Rate:</span>
                <span className="font-medium text-foreground">₹ {formData.goldRate} /g</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Deposit Amount:</span>
                <span className="font-medium text-foreground">₹ {formData.amount || 0}</span>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gold Credited</p>
                <p className="text-3xl font-bold text-primary">{calculatedGold} g</p>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="mb-2 font-medium text-destructive">Critical Warning</p>
                <p className="text-muted-foreground leading-relaxed">
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