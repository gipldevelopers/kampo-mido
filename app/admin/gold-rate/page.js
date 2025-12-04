"use client";
import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  History, 
  Save, 
  Clock, 
  AlertCircle,
  Calendar,
  FileText,
  Loader2
} from "lucide-react";
import Toast from "@/components/Toast";

// --- Mock History Data ---
const initialHistory = [
  { id: 1, rate: 7645, effective: "Today, 09:00 AM", updatedBy: "Admin", notes: "Market adjustment" },
  { id: 2, rate: 7600, effective: "Yesterday, 09:00 AM", updatedBy: "System", notes: "Daily update" },
  { id: 3, rate: 7550, effective: "01 Dec, 09:00 AM", updatedBy: "Admin", notes: "Weekend closing rate" },
];

export default function GoldRateManagement() {
  const [currentRate, setCurrentRate] = useState(7645);
  const [history, setHistory] = useState(initialHistory);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [newRate, setNewRate] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [notes, setNotes] = useState("");

  // FIX: Wrapped in setTimeout to avoid synchronous state update error
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setEffectiveDate(now.toISOString().slice(0, 16));
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!newRate || !effectiveDate) {
      setToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }

    setLoading(true);

    // Simulate Backend Process sequence
    setTimeout(() => {
      // Step 1: Update Rate
      setCurrentRate(Number(newRate));
      
      // Step 2: Add to History
      const newEntry = {
        id: Date.now(),
        rate: Number(newRate),
        effective: new Date(effectiveDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        updatedBy: "Admin",
        notes: notes || "Manual update"
      };
      setHistory([newEntry, ...history]);
      
      // Step 3: Trigger System Logic Simulations via Toasts
      setToast({ message: "Rate updated successfully", type: "success" });
      
      setTimeout(() => {
        setToast({ message: "System: Recalculating all customer wallets...", type: "success" });
      }, 1500);

      setTimeout(() => {
        setToast({ message: "System: Ledger revaluation entries created.", type: "success" });
        setLoading(false);
        setNewRate("");
        setNotes("");
      }, 3000);

    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Gold Rate Management</h2>
          <p className="text-sm text-muted-foreground">Set daily gold rates and manage revaluation.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Update Form (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Rate Display */}
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Current Active Rate</p>
              <h3 className="text-4xl font-bold text-primary flex items-baseline gap-2">
                ₹ {currentRate.toLocaleString()}
                <span className="text-lg font-medium text-muted-foreground">/ gram</span>
              </h3>
            </div>
            <div className="p-4 bg-background rounded-full border border-primary/20 shadow-sm">
              <TrendingUp size={32} className="text-primary" />
            </div>
          </div>

          {/* Update Form */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Clock size={18} className="text-muted-foreground" /> Update Today&apos;s Rate
            </h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">New Gold Rate (₹/g)</label>
                  <input 
                    type="number" 
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="e.g. 7650"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Effective Date & Time</label>
                  <div className="relative">
                    <input 
                      type="datetime-local" 
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none"
                      required
                    />
                    <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Rate Notes (Optional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for update (e.g., Market fluctuation)"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px]"
                ></textarea>
              </div>

              <div className="pt-2 bg-muted/30 p-4 rounded-md border border-border">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">System Actions upon Update:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>All customer wallet values will be recalculated immediately.</li>
                      <li>Ledger revaluation entries will be auto-generated.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Update Rate
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: History (Span 1) */}
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-fit">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <History size={18} className="text-muted-foreground" /> Recent History
            </h3>
          </div>
          <div className="divide-y divide-border">
            {history.map((item) => (
              <div key={item.id} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-lg font-bold text-foreground">₹ {item.rate.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border">
                    {item.updatedBy}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock size={12} /> {item.effective}
                </p>
                {item.notes && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <FileText size={12} className="mt-0.5 shrink-0" />
                    {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <button className="w-full py-2 text-sm text-primary font-medium hover:bg-primary/5 rounded-md transition-colors">
              View Full History
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}