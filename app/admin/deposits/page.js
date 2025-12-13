"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  FileText, 
  FileSpreadsheet,
  ChevronDown,
  ArrowDownCircle,
  Pencil,
  Trash2,
  Loader2
} from "lucide-react";
import Toast from "@/components/Toast";
import DepositService from "@/services/admin/deposit.service";


const StatusBadge = ({ status }) => {
  let styles = "bg-muted text-muted-foreground border-border";
  if (status === 'Converted') styles = "text-primary bg-primary/10 border-primary/20";
  if (status === 'Approved') styles = "text-blue-600 bg-blue-50 border-blue-200";
  if (status === 'Processing') styles = "text-yellow-600 bg-yellow-50 border-yellow-200";
  if (status === 'Pending') styles = "text-secondary-foreground bg-secondary border-secondary";
  if (status === 'Rejected') styles = "text-destructive bg-destructive/10 border-destructive/20";

  return (
    <span className={`px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${styles}`}>
      {status}
    </span>
  );
};

export default function DepositManagement() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All"); 
  const [toast, setToast] = useState(null); 
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const exportRef = useRef(null);

  // Fetch deposits from API
  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const response = await DepositService.getAllDeposits();
      
      // Handle different response structures
      let depositsData = [];
      if (response.data && Array.isArray(response.data)) {
        depositsData = response.data;
      } else if (Array.isArray(response)) {
        depositsData = response;
      } else if (response.deposits && Array.isArray(response.deposits)) {
        depositsData = response.deposits;
      }
      
      // Map API data to UI format
      const mappedDeposits = depositsData.map((deposit) => {
        const depositDate = deposit.depositDate || deposit.createdAt;
        let formattedDate = "N/A";
        if (depositDate) {
          try {
            const date = new Date(depositDate);
            formattedDate = date.toLocaleString('en-IN', { 
              dateStyle: 'medium', 
              timeStyle: 'short' 
            });
          } catch (error) {
            formattedDate = depositDate;
          }
        }
        
        // Map status correctly: pending, approved, processing, converted, rejected
        let status = "Pending";
        if (deposit.status === "converted" || deposit.status === "Converted") {
          status = "Converted";
        } else if (deposit.status === "approved" || deposit.status === "Approved") {
          status = "Approved";
        } else if (deposit.status === "processing" || deposit.status === "Processing") {
          status = "Processing";
        } else if (deposit.status === "rejected" || deposit.status === "Rejected") {
          status = "Rejected";
        } else if (deposit.status === "pending" || deposit.status === "Pending") {
          status = "Pending";
        } else if (deposit.status) {
          status = deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1).toLowerCase();
        }
        
        return {
          id: deposit.transactionId || deposit.id || `DEP-${deposit.id}`, // Display ID
          numericId: deposit.id, // Numeric ID for API calls
          customer: deposit.customer?.name || deposit.customerName || "N/A",
          amount: deposit.amount || 0,
          mode: deposit.mode || "UPI",
          date: formattedDate,
          rate: deposit.rateUsed || deposit.rate || 0,
          gold: deposit.gold || deposit.goldAmount || 0,
          status: status,
          // Store full deposit object for future use
          fullData: deposit
        };
      });
      
      setDeposits(mappedDeposits);
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching deposits:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch deposits";
      setToast({ message: errorMessage, type: "error" });
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDeposits = deposits.filter(dep => {
    const matchesSearch = dep.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dep.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "All") return matchesSearch;
    return matchesSearch && dep.status === filter;
  });

  const handleDelete = async (deposit) => {
    // Check if deposit is converted (cannot be deleted)
    if (deposit.status === "Converted" || deposit.status === "converted") {
      setToast({ 
        message: "Cannot delete a deposit that has been converted to gold. Please contact support if you need to modify this deposit.", 
        type: "error" 
      });
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete deposit ${deposit.id}? This action cannot be undone.`)) {
      return;
    }

    // Extract numeric ID for API call
    const numericId = deposit.numericId || deposit.id;
    let depositId = numericId;
    if (typeof numericId === 'string' && numericId.startsWith('DEP-')) {
      depositId = numericId.replace('DEP-', '');
    }

    setDeletingId(deposit.id);
    try {
      await DepositService.deleteDeposit(depositId);
      setToast({ message: "Deposit deleted successfully", type: "success" });
      // Refresh deposits list
      await fetchDeposits();
    } catch (error) {
      console.error("Error deleting deposit:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete deposit";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Deposit Management</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Track and manage manual UPI deposits.</p>
        </div>
        <Link href="/admin/deposits/add" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-all shadow-sm">
            <Plus size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Add Deposit</span>
          </button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search customer or TXN ID..." 
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
              <option value="Processing">Processing</option>
              <option value="Converted">Converted</option>
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
        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading deposits...</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {filteredDeposits.length > 0 ? (
            filteredDeposits.map((dep) => (
              <div key={dep.id} className="p-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{dep.id}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{dep.customer}</p>
                  </div>
                  <StatusBadge status={dep.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Amount</p>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">₹ {dep.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Gold</p>
                    <p className="text-xs sm:text-sm font-medium text-primary">{dep.gold} g</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Mode</p>
                    <span className="inline-block px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-medium">{dep.mode}</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Rate</p>
                    <p className="text-xs text-foreground">₹ {dep.rate}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground">{dep.date}</p>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/deposits/edit/${dep.numericId || dep.id}`}>
                      <button 
                        className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" 
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(dep)}
                      disabled={deletingId === dep.id || dep.status === "Converted" || dep.status === "converted"}
                      className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                      title={dep.status === "Converted" || dep.status === "converted" ? "Cannot delete converted deposits" : "Delete"}
                    >
                      {deletingId === dep.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No deposits found.</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Transaction ID</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Customer</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Amount</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Mode</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Date</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Rate Used</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Gold Credited</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Status</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDeposits.length > 0 ? (
                filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-foreground">{dep.id}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">{dep.customer}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold">₹ {dep.amount.toLocaleString()}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <span className="px-1.5 sm:px-2 py-0.5 bg-muted rounded border border-border text-[9px] sm:text-[10px] md:text-xs font-medium">{dep.mode}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">{dep.date}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">₹ {dep.rate}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-primary font-medium">{dep.gold} g</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4"><StatusBadge status={dep.status} /></td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                        <Link href={`/admin/deposits/edit/${dep.numericId || dep.id}`}>
                          <button 
                            className="p-1.5 lg:p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" 
                            title="Edit Deposit"
                          >
                            <Pencil size={14} className="lg:w-4 lg:h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(dep)}
                          disabled={deletingId === dep.id || dep.status === "Converted" || dep.status === "converted"}
                          className="p-1.5 lg:p-2 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                          title={dep.status === "Converted" || dep.status === "converted" ? "Cannot delete converted deposits" : "Delete Entry"}
                        >
                          {deletingId === dep.id ? (
                            <Loader2 size={14} className="lg:w-4 lg:h-4 animate-spin" />
                          ) : (
                            <Trash2 size={14} className="lg:w-4 lg:h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="px-6 py-8 text-center text-muted-foreground">No deposits found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
          </>
        )}
      </div>
    </div>
  );
}