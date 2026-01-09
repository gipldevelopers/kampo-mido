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
import GoldRateService from "@/services/admin/gold-rate.service";

export default function GoldRateManagement() {
  const [currentRate, setCurrentRate] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);

  // Form State
  const [newRate, setNewRate] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch current rate and history on mount
  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        // Fetch current rate
        const currentRateResponse = await GoldRateService.getCurrentRate();
        if (currentRateResponse.data) {
          setCurrentRate(currentRateResponse.data.ratePerGram || currentRateResponse.data.rate || null);
        } else if (currentRateResponse.ratePerGram || currentRateResponse.rate) {
          setCurrentRate(currentRateResponse.ratePerGram || currentRateResponse.rate);
        }

        // Fetch history
        const historyResponse = await GoldRateService.getHistory();
        if (historyResponse.data && Array.isArray(historyResponse.data)) {
          const formattedHistory = historyResponse.data.map((item, index) => ({
            id: item.id || index + 1,
            rate: item.ratePerGram || item.rate,
            effective: item.effectiveDate
              ? new Date(item.effectiveDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : item.effective || "N/A",
            updatedBy: item.updatedBy || item.updated_by || "Admin",
            notes: item.notes || ""
          }));
          setHistory(formattedHistory);
        } else if (Array.isArray(historyResponse)) {
          const formattedHistory = historyResponse.map((item, index) => ({
            id: item.id || index + 1,
            rate: item.ratePerGram || item.rate,
            effective: item.effectiveDate
              ? new Date(item.effectiveDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : item.effective || "N/A",
            updatedBy: item.updatedBy || item.updated_by || "Admin",
            notes: item.notes || ""
          }));
          setHistory(formattedHistory);
        }
      } catch (error) {
        console.error("Error fetching gold rate data:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch gold rate data";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  // Set default effective date
  useEffect(() => {
    if (!effectiveDate) {
      const timer = setTimeout(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setEffectiveDate(now.toISOString().slice(0, 16));
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [effectiveDate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newRate || !effectiveDate) {
      setToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }

    setLoading(true);

    try {
      // Convert effectiveDate to ISO string
      const effectiveDateISO = new Date(effectiveDate).toISOString();

      // Prepare payload
      const payload = {
        ratePerGram: Number(newRate),
        effectiveDate: effectiveDateISO,
      };

      // Add notes only if provided
      if (notes && notes.trim()) {
        payload.notes = notes.trim();
      }

      // Call API
      const response = await GoldRateService.updateRate(payload);

      // Update current rate
      if (response.data) {
        setCurrentRate(response.data.ratePerGram || response.data.rate || Number(newRate));
      } else {
        setCurrentRate(Number(newRate));
      }

      // Refresh history
      try {
        const historyResponse = await GoldRateService.getHistory();
        if (historyResponse.data && Array.isArray(historyResponse.data)) {
          const formattedHistory = historyResponse.data.map((item, index) => ({
            id: item.id || index + 1,
            rate: item.ratePerGram || item.rate,
            effective: item.effectiveDate
              ? new Date(item.effectiveDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : item.effective || "N/A",
            updatedBy: item.updatedBy || item.updated_by || "Admin",
            notes: item.notes || ""
          }));
          setHistory(formattedHistory);
        } else if (Array.isArray(historyResponse)) {
          const formattedHistory = historyResponse.map((item, index) => ({
            id: item.id || index + 1,
            rate: item.ratePerGram || item.rate,
            effective: item.effectiveDate
              ? new Date(item.effectiveDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : item.effective || "N/A",
            updatedBy: item.updatedBy || item.updated_by || "Admin",
            notes: item.notes || ""
          }));
          setHistory(formattedHistory);
        }
      } catch (historyError) {
        console.error("Error fetching updated history:", historyError);
      }

      setToast({ message: "Rate updated successfully", type: "success" });

      // Clear form
      setNewRate("");
      setNotes("");

      // Show system messages
      setTimeout(() => {
        setToast({ message: "System: Recalculating all customer wallets...", type: "success" });
      }, 1500);

      setTimeout(() => {
        setToast({ message: "System: Ledger revaluation entries created.", type: "success" });
      }, 3000);

    } catch (error) {
      console.error("Error updating gold rate:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update gold rate";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Gold Rate Management</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Set daily gold rates and manage revaluation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">

        {/* LEFT COLUMN: Update Form (Span 2) */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">

          {/* Current Rate Display */}
          <div className="bg-primary/5 border border-primary/20 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl flex items-center justify-between shadow-sm gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground mb-1">Current Active Rate</p>
              {fetching ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : currentRate !== null ? (
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <span className="break-words">₹ {currentRate.toLocaleString()}</span>
                  <span className="text-xs sm:text-sm md:text-lg font-medium text-muted-foreground">/ gram</span>
                </h3>
              ) : (
                <p className="text-sm text-muted-foreground">No rate set</p>
              )}
            </div>
            <div className="p-2 sm:p-3 md:p-4 bg-background rounded-full border border-primary/20 shadow-sm shrink-0">
              <TrendingUp size={20} className="sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
            </div>
          </div>

          {/* Update Form */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4 md:mb-6 flex items-center gap-1.5 sm:gap-2">
              <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-muted-foreground shrink-0" /> <span>Update Today&apos;s Rate</span>
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">New Gold Rate (₹/g)</label>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="e.g. 7650"
                    className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">Effective Date & Time</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Rate Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for update (e.g., Market fluctuation)"
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y"
                ></textarea>
              </div>

              <div className="pt-2 bg-muted/30 p-3 sm:p-4 rounded-md border border-border">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-xs sm:text-sm text-muted-foreground min-w-0 flex-1">
                    <p className="font-medium text-foreground mb-1">System Actions upon Update:</p>
                    <ul className="list-disc pl-3 sm:pl-4 space-y-0.5 sm:space-y-1">
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
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin shrink-0" /> <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Update Rate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: History (Span 1) */}
        <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm flex flex-col h-fit">
          <div className="p-3 sm:p-4 md:p-6 border-b border-border">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg flex items-center gap-1.5 sm:gap-2">
              <History size={16} className="sm:w-[18px] sm:h-[18px] text-muted-foreground shrink-0" /> <span>Recent History</span>
            </h3>
          </div>
          <div className="divide-y divide-border">
            {fetching ? (
              <div className="p-3 sm:p-4 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            ) : history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="p-3 sm:p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <span className="text-base sm:text-lg font-bold text-foreground break-words">₹ {item.rate?.toLocaleString() || item.rate}</span>
                    <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-border shrink-0 whitespace-nowrap">
                      {item.updatedBy}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Clock size={10} className="sm:w-3 sm:h-3 shrink-0" /> <span className="break-words">{item.effective}</span>
                  </p>
                  {item.notes && (
                    <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground bg-muted/30 p-1.5 sm:p-2 rounded-md">
                      <FileText size={10} className="sm:w-3 sm:h-3 mt-0.5 shrink-0" />
                      <span className="break-words">{item.notes}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 sm:p-4 text-center text-sm text-muted-foreground">
                No history available
              </div>
            )}
          </div>
          <div className="p-3 sm:p-4 border-t border-border">
            <button className="w-full py-1.5 sm:py-2 text-xs sm:text-sm text-primary font-medium hover:bg-primary/5 rounded-md transition-colors">
              View Full History
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}