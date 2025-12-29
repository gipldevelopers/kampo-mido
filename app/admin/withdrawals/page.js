"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  Loader2
} from "lucide-react";
import adminWithdrawalsService from "../../../services/admin/withdrawal-request.service";
import Toast from "@/components/Toast";

// --- Components ---
const StatusBadge = ({ status }) => {
  let styles = "bg-muted text-muted-foreground border-border";
  if (status === 'approved') styles = "text-primary bg-primary/10 border-primary/20";
  if (status === 'completed') styles = "text-green-600 bg-green-500/10 border-green-500/20";
  if (status === 'pending') styles = "text-secondary-foreground bg-secondary border-secondary";
  if (status === 'rejected') styles = "text-destructive bg-destructive/10 border-destructive/20";

  // Capitalize first letter
  const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${styles}`}>
      {statusDisplay}
    </span>
  );
};

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  // Fetch withdrawal requests
  const fetchWithdrawals = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      if (isRefresh) setRefreshing(true);

      const response = await adminWithdrawalsService.getWithdrawalRequests(
        pagination.page,
        pagination.limit,
        searchTerm,
        filter !== 'All' ? filter.toLowerCase() : 'All',
        typeFilter !== 'All' ? typeFilter.toLowerCase() : 'All'
      );

      if (response.success) {
        setWithdrawals(response.data.data || []);
        setPagination(response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      setToast({
        message: "Failed to load withdrawal requests",
        type: "error"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWithdrawals();
  }, [filter, typeFilter, pagination.page]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchWithdrawals();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle click outside export menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchWithdrawals(true);
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      setIsExportOpen(false);

      // Map filter values for API
      const status = filter !== 'All' ? filter.toLowerCase() : 'All';
      const type = typeFilter !== 'All' ? typeFilter.toLowerCase() : 'All';

      await adminWithdrawalsService.exportWithdrawals(format, status, type);

      setToast({
        message: `Exported to ${format.toUpperCase()} successfully`,
        type: "success"
      });
    } catch (error) {
      console.error("Error exporting:", error);
      setToast({
        message: "Failed to export data",
        type: "error"
      });
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Format INR
  const formatINR = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format type for display
  const formatType = (type) => {
    switch (type) {
      case 'money': return 'Money';
      case 'gold': return 'Physical Gold';
      case 'jewellery': return 'Jewellery';
      default: return type;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading withdrawal requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-2 sm:gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Withdrawal Requests</h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
              Manage customer requests for Gold, Cash, or Jewellery.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 sm:p-2 hover:bg-muted rounded-md transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customer, ID..."
            className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 sm:gap-3">
          {/* Status Filter */}
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

          {/* Type Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-auto h-full pl-3 sm:pl-4 pr-7 sm:pr-8 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary sm:min-w-[130px]"
            >
              <option value="All">All Types</option>
              <option value="Money">Money</option>
              <option value="Physical">Physical Gold</option>
              <option value="Jewellery">Jewellery</option>
            </select>
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={12} className="sm:w-3.5 sm:h-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Export Button */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="h-full flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-xs sm:text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <Download size={14} className="sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Export</span>
            </button>
            {isExportOpen && (
              <div className="absolute right-0 top-11 sm:top-12 w-36 sm:w-40 bg-card text-card-foreground border border-border rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-muted text-left"
                  >
                    <FileText size={12} className="sm:w-3.5 sm:h-3.5" /> PDF
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-muted text-left"
                  >
                    <FileSpreadsheet size={12} className="sm:w-3.5 sm:h-3.5" /> Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
          <p className="text-lg sm:text-xl font-bold">{pagination.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
          <p className="text-lg sm:text-xl font-bold text-secondary-foreground">
            {withdrawals.filter(w => w.status === 'pending').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] sm:text-xs text-muted-foreground">Approved</p>
          <p className="text-lg sm:text-xl font-bold text-primary">
            {withdrawals.filter(w => w.status === 'approved').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
          <p className="text-lg sm:text-xl font-bold text-green-600">
            {withdrawals.filter(w => w.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Table - Mobile Card View / Desktop Table View */}
      <div className="bg-card rounded-lg sm:rounded-xl border border-border shadow-sm overflow-hidden">
        {refreshing && (
          <div className="p-2 text-center bg-primary/10">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            <span className="text-xs">Refreshing...</span>
          </div>
        )}

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border">
          {withdrawals.length > 0 ? (
            withdrawals.map((w) => (
              <div key={w.withdrawalId} className="p-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{w.withdrawalId}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{w.customer}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Type</p>
                    <span className="inline-block px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-medium mt-0.5">
                      {formatType(w.type)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Grams</p>
                    <p className="text-xs font-semibold text-primary">{w.grams ? `${w.grams.toFixed(2)} g` : 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Value</p>
                    <p className="text-xs text-foreground">{w.approximateValueDisplay || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Date</p>
                    <p className="text-xs text-foreground">{w.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end pt-2 border-t border-border">
                  <Link href={`/admin/withdrawals/${w.withdrawalId}`}>
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
              {withdrawals.length > 0 ? (
                withdrawals.map((w) => (
                  <tr key={w.withdrawalId} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-foreground">{w.withdrawalId}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">{w.customer}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <span className="px-1.5 sm:px-2 py-0.5 bg-muted rounded border border-border text-[9px] sm:text-[10px] md:text-xs font-medium">
                        {formatType(w.type)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-primary">
                      {w.grams ? `${w.grams.toFixed(2)} g` : 'N/A'}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">
                      {w.approximateValueDisplay || 'N/A'}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">{w.date}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                      <Link href={`/admin/withdrawals/${w.withdrawalId}`}>
                        <button className="p-1.5 lg:p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors" title="View & Process">
                          <Eye size={14} className="lg:w-4 lg:h-4" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">
                    No withdrawal requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-2 sm:px-3 py-1 text-xs border border-input rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                Previous
              </button>
              <span className="px-2 sm:px-3 py-1 text-xs">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-2 sm:px-3 py-1 text-xs border border-input rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}