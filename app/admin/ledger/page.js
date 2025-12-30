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
  ArrowRightLeft,
  FileText,
  FileSpreadsheet,
  Wallet,
  Users,
  FileBarChart2,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Loader2,
  Coins
} from "lucide-react";
import Toast from "@/components/Toast";
import ledgerReportsService from "../../../services/admin/ledger-report.service";

// Reusable CoinsIcon component using the imported Coins from lucide-react
function CoinsIcon(props) {
  return <Coins {...props} />;
}

const TypeBadge = ({ type }) => {
  let styles = "bg-muted text-muted-foreground border-border";
  let icon = null;

  // Safe type checking
  const typeStr = (typeof type === 'object' && type !== null) ? (type.name || type.type || 'Unknown') : String(type || 'Unknown');

  if (typeStr === 'Deposit') {
    styles = "bg-green-500/10 text-green-600 border-green-500/20";
    icon = <ArrowDownLeft size={10} className="sm:w-3 sm:h-3 mr-0.5 sm:mr-1 shrink-0" />;
  } else if (typeStr === 'Withdrawal') {
    styles = "bg-destructive/10 text-destructive border-destructive/20";
    icon = <ArrowUpRight size={10} className="sm:w-3 sm:h-3 mr-0.5 sm:mr-1 shrink-0" />;
  } else if (typeStr === 'Revaluation') {
    styles = "bg-primary/10 text-primary border-primary/20";
    icon = <RefreshCcw size={10} className="sm:w-3 sm:h-3 mr-0.5 sm:mr-1 shrink-0" />;
  } else if (typeStr === 'Conversion') {
    styles = "bg-blue-500/10 text-blue-600 border-blue-500/20";
    icon = <ArrowRightLeft size={10} className="sm:w-3 sm:h-3 mr-0.5 sm:mr-1 shrink-0" />;
  }

  return (
    <span className={`flex items-center w-fit px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${styles}`}>
      {icon} <span>{typeStr}</span>
    </span>
  );
};

export default function LedgerAndReports() {
  const [activeTab, setActiveTab] = useState("ledger");
  const [ledgerData, setLedgerData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeTab === "ledger") {
      fetchLedgerData();
    } else {
      fetchReportTypes();
      fetchRecentReports();
    }
  }, [activeTab]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === "ledger") {
        fetchLedgerData(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterType]);

  const fetchLedgerData = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page: page,
        limit: pagination.limit || 10,
        search: searchTerm,
        type: filterType === "All" ? undefined : filterType
      };

      const response = await ledgerReportsService.getLedgerData(params);
      console.log('Ledger API Response:', response); // Debug log

      if (response.success) {
        setLedgerData(response.data?.entries || []);
        setPagination(response.data?.pagination || {
          page,
          limit: pagination.limit,
          total: response.data?.total || 0,
          totalPages: response.data?.totalPages || 1
        });
      } else {
        setLedgerData([]);
        setToast({
          message: response.message || "Failed to load ledger data",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setLedgerData([]);
      setToast({
        message: error.response?.data?.message || "Failed to load ledger data",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReportTypes = async () => {
    try {
      const response = await ledgerReportsService.getReportTypes();
      console.log('Report Types API Response:', response); // Debug log

      if (response.success) {
        // Map the API response to include proper icon components
        const mappedReportTypes = (response.data || []).map(report => {
          let IconComponent;
          switch (report.icon || report.title) {
            case 'Wallet':
              IconComponent = Wallet;
              break;
            case 'Coins':
            case 'CoinsIcon':
              IconComponent = CoinsIcon;
              break;
            case 'Users':
              IconComponent = Users;
              break;
            case 'FileBarChart2':
              IconComponent = FileBarChart2;
              break;
            case 'TrendingUp':
              IconComponent = TrendingUp;
              break;
            case 'AlertTriangle':
              IconComponent = AlertTriangle;
              break;
            default:
              IconComponent = FileText;
          }

          return {
            ...report,
            icon: IconComponent
          };
        });

        setReportTypes(mappedReportTypes);
      } else {
        // Fallback to default report types
        setReportTypes([
          { id: 1, title: "Daily Deposit Report", desc: "Summary of all UPI deposits for today.", icon: Wallet },
          { id: 2, title: "Weekly Gold Liability", desc: "Total gold owed to customers this week.", icon: CoinsIcon },
          { id: 3, title: "KYC Status Report", desc: "Pending, approved, and rejected KYC stats.", icon: Users },
          { id: 4, title: "Customer Balance Sheet", desc: "Wallet balances (INR & Gold) for all users.", icon: FileBarChart2 },
          { id: 5, title: "Profit & Loss Statement", desc: "Net profit based on gold rate fluctuations.", icon: TrendingUp },
          { id: 6, title: "Suspicious Activity Log", desc: "Flagged transactions and high-value movements.", icon: AlertTriangle },
        ]);
      }
    } catch (error) {
      console.error('Error fetching report types:', error);
      // Fallback to default report types
      setReportTypes([
        { id: 1, title: "Daily Deposit Report", desc: "Summary of all UPI deposits for today.", icon: Wallet },
        { id: 2, title: "Weekly Gold Liability", desc: "Total gold owed to customers this week.", icon: CoinsIcon },
        { id: 3, title: "KYC Status Report", desc: "Pending, approved, and rejected KYC stats.", icon: Users },
        { id: 4, title: "Customer Balance Sheet", desc: "Wallet balances (INR & Gold) for all users.", icon: FileBarChart2 },
        { id: 5, title: "Profit & Loss Statement", desc: "Net profit based on gold rate fluctuations.", icon: TrendingUp },
        { id: 6, title: "Suspicious Activity Log", desc: "Flagged transactions and high-value movements.", icon: AlertTriangle },
      ]);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const response = await ledgerReportsService.getRecentReports();
      console.log('Recent Reports API Response:', response); // Debug log

      if (response.success) {
        setRecentReports(response.data || []);
      } else {
        setRecentReports([]);
      }
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      setRecentReports([]);
    }
  };

  const handleExport = async (format) => {
    try {
      setToast({
        message: `Exporting Ledger as ${format}...`,
        type: "info"
      });

      const exportData = {
        format: format.toLowerCase(),
        search: searchTerm,
        type: filterType === "All" ? undefined : filterType
      };

      await ledgerReportsService.downloadExportedLedger(exportData, format.toLowerCase());

      setToast({
        message: `Ledger exported successfully as ${format}!`,
        type: "success"
      });
    } catch (error) {
      console.error('Export error:', error);
      setToast({
        message: `Failed to export ledger as ${format}`,
        type: "error"
      });
    } finally {
      setIsExportOpen(false);
    }
  };

  const handleGenerateReport = async (id, title) => {
    try {
      setGeneratingId(id);
      setToast({
        message: `Generating ${title}...`,
        type: "info"
      });

      const response = await ledgerReportsService.generateReport(id);

      if (response.success) {
        setToast({
          message: `${title} generated successfully!`,
          type: "success"
        });

        // Refresh recent reports
        fetchRecentReports();
      } else {
        setToast({
          message: response.message || `Failed to generate ${title}`,
          type: "error"
        });
      }
    } catch (error) {
      console.error('Generate report error:', error);
      setToast({
        message: error.response?.data?.message || `Failed to generate ${title}`,
        type: "error"
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownloadReport = async (reportId, format = 'pdf') => {
    try {
      setToast({
        message: `Downloading report...`,
        type: "info"
      });

      const response = await ledgerReportsService.downloadReport(reportId, format);

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setToast({
        message: `Report downloaded successfully!`,
        type: "success"
      });
    } catch (error) {
      console.error('Download report error:', error);
      setToast({
        message: `Failed to download report`,
        type: "error"
      });
    }
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      const prevPage = pagination.page - 1;
      setPagination(prev => ({ ...prev, page: prevPage }));
      fetchLedgerData(prevPage);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      const nextPage = pagination.page + 1;
      setPagination(prev => ({ ...prev, page: nextPage }));
      fetchLedgerData(nextPage);
    }
  };

  // Safe renderer for potential objects
  const renderCell = (val) => {
    if (val === null || val === undefined) return "-";
    if (typeof val === 'object') {
      return val.name || val.title || val.username || val.id || JSON.stringify(val);
    }
    return val;
  };

  // Switch from local filtering to using API data directly since we now pass params
  const filteredLedger = ledgerData;

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Financial Ledger</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Manage financial records.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("ledger")}
            className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === "ledger"
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Financial Ledger
            {activeTab === "ledger" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
          </button>
        </nav>
      </div>

      {/* --- TAB CONTENT: LEDGER --- */}
      {activeTab === "ledger" && (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Customer or Transaction ID..."
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-auto h-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary sm:min-w-[160px]"
                >
                  <option value="All">All Transactions</option>
                  <option value="Deposit">Deposits</option>
                  <option value="Conversion">Gold Conversions</option>
                  <option value="Withdrawal">Withdrawals</option>
                  <option value="Revaluation">Revaluations</option>
                </select>
                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={12} className="sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                </div>
              </div>

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
                        onClick={() => handleExport('PDF')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-muted text-left"
                      >
                        <FileText size={12} className="sm:w-3.5 sm:h-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => handleExport('Excel')}
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

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-sm">Loading ledger data...</span>
            </div>
          ) : (
            <>
              {/* Table - Mobile Card View / Desktop Table View */}
              <div className="bg-card rounded-lg sm:rounded-xl border border-border shadow-sm overflow-hidden">
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-border">
                  {filteredLedger.length > 0 ? (
                    filteredLedger.map((row) => (
                      <div key={row.id || Math.random()} className="p-3 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{renderCell(row.id)}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{renderCell(row.customer)}</p>
                          </div>
                          <TypeBadge type={row.type} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Date</p>
                            <p className="text-xs text-foreground">{renderCell(row.date)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Rate</p>
                            <p className="text-xs text-foreground">₹ {renderCell(row.rate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Amount</p>
                            <p className="text-xs sm:text-sm font-medium text-foreground">
                              {(typeof row.amount === 'number' || typeof row.amount === 'string')
                                ? (Number(row.amount) > 0 ? `₹ ${Number(row.amount).toLocaleString()}` : "-")
                                : renderCell(row.amount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Gold Impact</p>
                            <p className={`text-xs sm:text-sm font-bold ${row.impact === 'Credit' ? 'text-green-600' :
                              row.impact === 'Debit' ? 'text-destructive' : 'text-muted-foreground'
                              }`}>
                              {row.impact === 'Credit' ? '+' : row.impact === 'Debit' ? '-' : ''}
                              {(typeof row.gold === 'number' || typeof row.gold === 'string')
                                ? (Number(row.gold) > 0 ? `${row.gold} g` : '-')
                                : renderCell(row.gold)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-sm">No ledger entries found.</p>
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Date & Time</th>
                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Txn ID</th>
                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Customer/Source</th>
                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Type</th>
                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Amount (₹)</th>
                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Rate</th>
                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium text-right">Gold Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredLedger.length > 0 ? (
                        filteredLedger.map((row) => (
                          <tr key={row.id || Math.random()} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">{renderCell(row.date)}</td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-foreground">{renderCell(row.id)}</td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4">{renderCell(row.customer)}</td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4">
                              <TypeBadge type={row.type} />
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium">
                              {(typeof row.amount === 'number' || typeof row.amount === 'string')
                                ? (Number(row.amount) > 0 ? `₹ ${Number(row.amount).toLocaleString()}` : "-")
                                : renderCell(row.amount)}
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">₹ {renderCell(row.rate)}</td>
                            <td className={`px-4 lg:px-6 py-3 lg:py-4 text-right font-bold ${row.impact === 'Credit' ? 'text-green-600' :
                              row.impact === 'Debit' ? 'text-destructive' : 'text-muted-foreground'
                              }`}>
                              {row.impact === 'Credit' ? '+' : row.impact === 'Debit' ? '-' : ''}
                              {(typeof row.gold === 'number' || typeof row.gold === 'string')
                                ? (Number(row.gold) > 0 ? `${row.gold} g` : '-')
                                : renderCell(row.gold)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                            No ledger entries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="border-t border-border p-4 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Showing {filteredLedger.length} of {pagination.total} entries
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 text-xs border rounded-md disabled:opacity-50 hover:bg-muted transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-xs">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1 text-xs border rounded-md disabled:opacity-50 hover:bg-muted transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}