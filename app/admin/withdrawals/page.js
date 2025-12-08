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
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
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
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Withdrawal Requests</h2>
          <p className="text-sm text-muted-foreground">Manage customer requests for Gold, Cash, or Jewellery.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search customer or ID..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter size={16} className="text-muted-foreground" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-full pl-9 pr-8 py-2 bg-background border border-input rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
          </div>

          <div className="relative" ref={exportRef}>
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="h-full flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-sm font-medium hover:bg-muted/80 transition-colors">
              <Download size={16} /> Export
            </button>
            {isExportOpen && (
              <div className="absolute right-0 top-12 w-40 bg-card text-card-foreground border border-border rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left"><FileText size={14} /> PDF</button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left"><FileSpreadsheet size={14} /> Excel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Request Type</th>
                <th className="px-6 py-3 font-medium">Grams</th>
                <th className="px-6 py-3 font-medium">Value (Approx)</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{w.id}</td>
                    <td className="px-6 py-4">{w.customer}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-muted rounded border border-border text-xs font-medium">{w.type}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">{w.grams} g</td>
                    <td className="px-6 py-4 text-muted-foreground">₹ {w.value.toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground">{w.date}</td>
                    <td className="px-6 py-4"><StatusBadge status={w.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/withdrawals/${w.id}`}>
                        <button className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors" title="View & Process">
                          <Eye size={16} />
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