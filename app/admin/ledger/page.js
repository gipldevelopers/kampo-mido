"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  ArrowRightLeft, // Added icon for Conversion
  FileText, 
  FileSpreadsheet,
  Wallet,
  Users,
  FileBarChart2,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ChevronRight
} from "lucide-react";
import Toast from "@/components/Toast";

// --- Mock Data ---
const initialLedger = [
  { id: "TXN-8001", date: "Today, 10:23 AM", customer: "Rahul Sharma", type: "Deposit", amount: 25000, rate: 7645, gold: 3.27, impact: "Credit" },
  { id: "TXN-8002", date: "Today, 09:00 AM", customer: "System", type: "Revaluation", amount: 0, rate: 7645, gold: 0, impact: "Neutral" },
  { id: "TXN-8003", date: "Yesterday, 3:30 PM", customer: "Priya Singh", type: "Withdrawal", amount: 42047, rate: 7600, gold: 5.50, impact: "Debit" },
  { id: "TXN-8004", date: "01 Dec, 11:00 AM", customer: "Amit Kumar", type: "Deposit", amount: 10000, rate: 7550, gold: 1.32, impact: "Credit" },
  { id: "TXN-8005", date: "30 Nov, 09:00 AM", customer: "System", type: "Revaluation", amount: 0, rate: 7550, gold: 0, impact: "Neutral" },
  { id: "TXN-8006", date: "29 Nov, 02:15 PM", customer: "Sneha Gupta", type: "Conversion", amount: 50000, rate: 7520, gold: 6.64, impact: "Credit" }, // Added Conversion Entry
];

const reportTypes = [
  { id: 1, title: "Daily Deposit Report", desc: "Summary of all UPI deposits for today.", icon: Wallet },
  { id: 2, title: "Weekly Gold Liability", desc: "Total gold owed to customers this week.", icon: CoinsIcon },
  { id: 3, title: "KYC Status Report", desc: "Pending, approved, and rejected KYC stats.", icon: Users },
  { id: 4, title: "Customer Balance Sheet", desc: "Wallet balances (INR & Gold) for all users.", icon: FileBarChart2 },
  { id: 5, title: "Profit & Loss Statement", desc: "Net profit based on gold rate fluctuations.", icon: TrendingUp },
  { id: 6, title: "Suspicious Activity Log", desc: "Flagged transactions and high-value movements.", icon: AlertTriangle },
];

function CoinsIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" /></svg>
  );
}

const TypeBadge = ({ type }) => {
  let styles = "bg-muted text-muted-foreground border-border";
  let icon = null;

  if (type === 'Deposit') {
    styles = "bg-green-500/10 text-green-600 border-green-500/20";
    icon = <ArrowDownLeft size={12} className="mr-1" />;
  } else if (type === 'Withdrawal') {
    styles = "bg-destructive/10 text-destructive border-destructive/20";
    icon = <ArrowUpRight size={12} className="mr-1" />;
  } else if (type === 'Revaluation') {
    styles = "bg-primary/10 text-primary border-primary/20";
    icon = <RefreshCcw size={12} className="mr-1" />;
  } else if (type === 'Conversion') { // Added Conversion Style
    styles = "bg-blue-500/10 text-blue-600 border-blue-500/20";
    icon = <ArrowRightLeft size={12} className="mr-1" />;
  }

  return (
    <span className={`flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
      {icon} {type}
    </span>
  );
};

export default function LedgerAndReports() {
  const [activeTab, setActiveTab] = useState("ledger"); // 'ledger' or 'reports'
  const [ledgerData] = useState(initialLedger);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All"); 
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLedger = ledgerData.filter(item => {
    const matchesSearch = item.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === "All") return matchesSearch;
    return matchesSearch && item.type === filterType;
  });

  const handleExport = (type) => {
    setToast({ message: `Exporting Ledger as ${type}...`, type: "success" });
    setIsExportOpen(false);
  };

  const handleGenerateReport = (id, title) => {
    setGeneratingId(id);
    setTimeout(() => {
      setGeneratingId(null);
      setToast({ message: `${title} generated successfully!`, type: "success" });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Ledger & Reports</h2>
          <p className="text-sm text-muted-foreground">Manage financial records and generate system reports.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("ledger")}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === "ledger" 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            General Ledger
            {activeTab === "ledger" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === "reports" 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Reports Section
            {activeTab === "reports" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
          </button>
        </nav>
      </div>

      {/* --- TAB CONTENT: LEDGER --- */}
      {activeTab === "ledger" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search Customer or Transaction ID..." 
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-full pl-9 pr-8 py-2 bg-background border border-input rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px]"
                >
                  <option value="All">All Transactions</option>
                  <option value="Deposit">Deposits</option>
                  <option value="Conversion">Gold Conversions</option> {/* Added Filter Option */}
                  <option value="Withdrawal">Withdrawals</option>
                  <option value="Revaluation">Revaluations</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={14} className="text-muted-foreground" />
                </div>
              </div>

              <div className="relative" ref={exportRef}>
                <button 
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="h-full flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <Download size={16} /> Export
                </button>
                {isExportOpen && (
                  <div className="absolute right-0 top-12 w-40 bg-card text-card-foreground border border-border rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1">
                      <button onClick={() => handleExport('PDF')} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left">
                        <FileText size={14} /> PDF
                      </button>
                      <button onClick={() => handleExport('Excel')} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left">
                        <FileSpreadsheet size={14} /> Excel
                      </button>
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
                    <th className="px-6 py-3 font-medium">Date & Time</th>
                    <th className="px-6 py-3 font-medium">Txn ID</th>
                    <th className="px-6 py-3 font-medium">Customer/Source</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Amount (₹)</th>
                    <th className="px-6 py-3 font-medium">Rate</th>
                    <th className="px-6 py-3 font-medium text-right">Gold Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLedger.length > 0 ? (
                    filteredLedger.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground">{row.date}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{row.id}</td>
                        <td className="px-6 py-4">{row.customer}</td>
                        <td className="px-6 py-4"><TypeBadge type={row.type} /></td>
                        <td className="px-6 py-4 font-medium">
                          {row.amount > 0 ? `₹ ${row.amount.toLocaleString()}` : "-"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">₹ {row.rate}</td>
                        <td className={`px-6 py-4 text-right font-bold ${
                          row.impact === 'Credit' ? 'text-green-600' : 
                          row.impact === 'Debit' ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          {row.impact === 'Credit' ? '+' : row.impact === 'Debit' ? '-' : ''}
                          {row.gold > 0 ? `${row.gold} g` : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">No ledger entries found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: REPORTS --- */}
      {activeTab === "reports" && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => (
              <div key={report.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <report.icon size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{report.desc}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleGenerateReport(report.id, report.title)}
                      disabled={generatingId === report.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
                    >
                      {generatingId === report.id ? "Generating..." : "Generate Report"}
                    </button>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-background border border-input rounded-md text-xs font-medium hover:bg-muted transition-colors">
                      <FileText size={14} className="text-muted-foreground" /> PDF
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-background border border-input rounded-md text-xs font-medium hover:bg-muted transition-colors">
                      <Download size={14} className="text-muted-foreground" /> Excel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Downloads */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-muted/30 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar size={16} /> Recently Generated
              </h3>
              <button className="text-xs text-primary hover:underline flex items-center">View All <ChevronRight size={12} /></button>
            </div>
            <div className="divide-y divide-border">
              {[
                { name: "Daily Deposit Report - 04 Dec", type: "PDF", size: "1.2 MB", date: "Today, 10:00 AM" },
                { name: "Weekly Liability - Week 48", type: "Excel", size: "450 KB", date: "Yesterday, 05:30 PM" },
                { name: "Customer Balance Sheet", type: "Excel", size: "2.8 MB", date: "01 Dec, 09:15 AM" }
              ].map((file, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded text-secondary-foreground">
                      {file.type === "PDF" ? <FileText size={16} /> : <FileSpreadsheet size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.date} • {file.size}</p>
                    </div>
                  </div>
                  <button className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}