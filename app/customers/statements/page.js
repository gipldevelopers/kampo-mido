"use client";
import { useState, useEffect } from "react";
import { 
  FileText, 
  Download,
  Calendar,
  Filter,
  ChevronDown,
  Loader2
} from "lucide-react";
import Toast from "@/components/Toast";
import StatementsService from "../../../services/customer/statement.service";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export default function StatementsPage() {
  const [toast, setToast] = useState(null);
  const [statementType, setStatementType] = useState("weekly"); // 'weekly' or 'monthly'
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [statements, setStatements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  // Fetch statements on component mount and when type changes
  useEffect(() => {
    fetchStatements();
    fetchSummary();
  }, [statementType]);

  const fetchStatements = async (page = 1) => {
    try {
      setLoading(true);
      const response = await StatementsService.getStatements(
        page,
        pagination.limit,
        statementType
      );
      
      const data = response.data || response;
      const statementsList = data.statements || data || [];
      
      setStatements(statementsList);
      
      // Update pagination if available
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          currentPage: data.pagination.currentPage || page,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.totalItems || statementsList.length
        }));
      } else if (data.currentPage) {
        setPagination(prev => ({
          ...prev,
          currentPage: data.currentPage,
          totalPages: data.totalPages || 1,
          totalItems: data.totalItems || statementsList.length
        }));
      }
    } catch (error) {
      console.error("Error fetching statements:", error);
      setToast({ 
        message: error.response?.data?.message || "Failed to load statements", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await StatementsService.getStatementSummary();
      const data = response.data || response;
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      // Don't show toast for summary errors as it's not critical
    }
  };

  const handleDownload = async (statementId) => {
    try {
      setDownloadLoading(statementId);
      const result = await StatementsService.downloadStatement(statementId);
      
      setToast({ 
        message: `Statement "${result.fileName}" downloaded successfully!`, 
        type: "success" 
      });
    } catch (error) {
      console.error("Error downloading statement:", error);
      setToast({ 
        message: error.response?.data?.message || "Failed to download statement", 
        type: "error" 
      });
    } finally {
      setDownloadLoading(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchStatements(newPage);
    }
  };

  const getStatementPeriodText = (statement) => {
    if (statement.period) return statement.period;
    
    if (statement.startDate && statement.endDate) {
      const start = new Date(statement.startDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
      });
      const end = new Date(statement.endDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      return `${start} - ${end}`;
    }
    
    if (statement.month && statement.year) {
      const date = new Date(statement.year, statement.month - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    return statement.description || "Statement";
  };

  const getStatementDate = (statement) => {
    if (statement.generatedAt) {
      return formatDate(statement.generatedAt);
    }
    if (statement.createdAt) {
      return formatDate(statement.createdAt);
    }
    return "N/A";
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Statements</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">View and download your account statements.</p>
        </div>
        
        {summary && (
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <div className="px-2 sm:px-3 py-1 bg-primary/10 rounded-md">
              <span className="text-primary font-semibold">{summary.totalStatements || 0}</span>
              <span className="text-muted-foreground ml-1">Total Statements</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-3 sm:gap-4 md:gap-6">
          <button
            onClick={() => setStatementType("weekly")}
            disabled={loading}
            className={`pb-2 sm:pb-3 text-[11px] sm:text-xs md:text-sm font-medium transition-all relative ${
              statementType === "weekly" 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Weekly Statements
            {statementType === "weekly" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button
            onClick={() => setStatementType("monthly")}
            disabled={loading}
            className={`pb-2 sm:pb-3 text-[11px] sm:text-xs md:text-sm font-medium transition-all relative ${
              statementType === "monthly" 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Monthly Statements
            {statementType === "monthly" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px] sm:min-h-[400px]">
        {/* Statements List */}
        <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 md:p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg">
                {statementType === "weekly" ? "Weekly Statements" : "Monthly Statements"}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                <Filter size={12} className="sm:w-4 sm:h-4" />
                <span>{statements.length} Statements</span>
              </div>
            </div>
          </div>
        
          <div className="divide-y divide-border">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : statements.length > 0 ? (
              <>
                {statements.map((statement) => (
                  <div key={statement.id || statement.statementId} className="p-3 sm:p-4 md:p-6 hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="p-2 sm:p-2.5 md:p-3 bg-primary/10 rounded-lg shrink-0">
                          <FileText size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[11px] sm:text-xs md:text-sm text-foreground mb-1 truncate">
                            {getStatementPeriodText(statement)}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5 sm:gap-1">
                              <Calendar size={10} className="sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
                              {getStatementDate(statement)}
                            </span>
                            {statement.fileSize && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span>{statement.fileSize}</span>
                              </>
                            )}
                            {statement.type && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded text-[8px]">
                                  {statement.type.charAt(0).toUpperCase() + statement.type.slice(1)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(statement.id || statement.statementId)}
                        disabled={downloadLoading === (statement.id || statement.statementId)}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-[10px] sm:text-xs md:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
                      >
                        {downloadLoading === (statement.id || statement.statementId) ? (
                          <>
                            <Loader2 size={12} className="sm:w-4 sm:h-4 animate-spin" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download size={12} className="sm:w-4 sm:h-4" />
                            <span>Download PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="p-3 sm:p-4 md:p-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        Showing page {pagination.currentPage} of {pagination.totalPages}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1 || loading}
                          className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs border border-input rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = pagination.currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loading}
                              className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs border rounded ${
                                pagination.currentPage === pageNum
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'border-input hover:bg-accent'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages || loading}
                          className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs border border-input rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <FileText size={36} className="sm:w-12 sm:h-12 md:w-12 md:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                  No {statementType} statements available yet.
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                  {statementType === "weekly" 
                    ? "Weekly statements are generated every Monday."
                    : "Monthly statements are generated on the 1st of each month."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-1.5 sm:mb-2">About Statements</p>
        <ul className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground space-y-0.5 sm:space-y-1 list-disc list-inside">
          <li>Weekly statements are generated every Monday</li>
          <li>Monthly statements are generated on the 1st of each month</li>
          <li>Statements include all transactions, deposits, withdrawals, and gold conversions</li>
          <li>Download statements in PDF format for your records</li>
          {summary && (
            <li className="mt-1 pt-1 border-t border-primary/10">
              <span className="font-medium">Quick Stats:</span>{" "}
              {summary.weeklyCount || 0} weekly, {summary.monthlyCount || 0} monthly statements
            </li>
          )}
        </ul>
      </div>

    </div>
  );
}