"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronDown,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import Toast from "@/components/Toast";

// --- Mock Data ---
const initialWithdrawals = [
  { id: "WDR-5001", customer: "Rahul Sharma", type: "Physical Gold", grams: 10.00, value: 76450, date: "Today, 11:00 AM", status: "Pending" },
  { id: "WDR-5002", customer: "Priya Singh", type: "Money", grams: 5.50, value: 42047, date: "Yesterday, 3:30 PM", status: "Approved" },
  { id: "WDR-5003", customer: "Amit Kumar", type: "Jewellery", grams: 15.00, value: 114675, date: "01 Dec, 10:15 AM", status: "Completed" },
  { id: "WDR-5004", customer: "Sneha Gupta", type: "Money", grams: 2.00, value: 15290, date: "30 Nov, 09:00 AM", status: "Rejected" },
  { id: "WDR-5005", customer: "Vikram Malhotra", type: "Physical Gold", grams: 50.00, value: 382250, date: "29 Nov, 1:45 PM", status: "Pending" },
];

// --- Components ---
const StatusBadge = ({ status }) => {
  let styles = "bg-muted text-muted-foreground border-border";
  if (status === 'Approved') styles = "text-primary bg-primary/10 border-primary/20"; // Gold/Yellowish
  if (status === 'Completed') styles = "text-green-600 bg-green-500/10 border-green-500/20"; // Green for finished
  if (status === 'Pending') styles = "text-secondary-foreground bg-secondary border-secondary"; // Grey/Neutral
  if (status === 'Rejected') styles = "text-destructive bg-destructive/10 border-destructive/20"; // Red

  return (
    <span className={`px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${styles}`}>
      {status}
    </span>
  );
};

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All"); 
  const [toast, setToast] = useState(null);
  
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = w.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "All") return matchesSearch;
    return matchesSearch && w.status === filter;
  });

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Withdrawal Requests</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Manage customer requests for Gold, Cash, or Jewellery.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search customer or ID..." 
            className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter size={14} className="sm:w-4 sm:h-4 text-muted-foreground" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto h-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary sm:min-w-[150px]"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={12} className="sm:w-3.5 sm:h-3.5 text-muted-foreground" />
            </div>
          </div>

          <div className="relative" ref={exportRef}>
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="h-full flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-xs sm:text-sm font-medium hover:bg-muted/80 transition-colors">
              <Download size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">Export</span>
            </button>
            {isExportOpen && (
              <div className="absolute right-0 top-11 sm:top-12 w-36 sm:w-40 bg-card text-card-foreground border border-border rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-muted text-left"><FileText size={12} className="sm:w-3.5 sm:h-3.5" /> PDF</button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-muted text-left"><FileSpreadsheet size={12} className="sm:w-3.5 sm:h-3.5" /> Excel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table - Mobile Card View / Desktop Table View */}
      <div className="bg-card rounded-lg sm:rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border">
          {filteredWithdrawals.length > 0 ? (
            filteredWithdrawals.map((w) => (
              <div key={w.id} className="p-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{w.id}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{w.customer}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Type</p>
                    <span className="inline-block px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-medium mt-0.5">{w.type}</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Grams</p>
                    <p className="text-xs font-semibold text-primary">{w.grams} g</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Value</p>
                    <p className="text-xs text-foreground">₹ {w.value.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Date</p>
                    <p className="text-xs text-foreground">{w.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end pt-2 border-t border-border">
                  <Link href={`/admin/withdrawals/${w.id}`}>
                    <button className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors" title="View">
                      <Eye size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No withdrawal requests found.</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">ID</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Customer</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Request Type</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Grams</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Value (Approx)</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Date</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Status</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-foreground">{w.id}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">{w.customer}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <span className="px-1.5 sm:px-2 py-0.5 bg-muted rounded border border-border text-[9px] sm:text-[10px] md:text-xs font-medium">{w.type}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-primary">{w.grams} g</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">₹ {w.value.toLocaleString()}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">{w.date}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4"><StatusBadge status={w.status} /></td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                      <Link href={`/admin/withdrawals/${w.id}`}>
                        <button className="p-1.5 lg:p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors" title="View & Process">
                          <Eye size={14} className="lg:w-4 lg:h-4" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">No withdrawal requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}