"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Clock,
  User,
  FileText,
  ChevronDown,
  ChevronRight,
  Eye,
  Calendar,
  Loader2,
  RefreshCcw,
  ArrowRight
} from "lucide-react";
import AuditLogService from "@/services/admin/audit-log.service";
import CustomerService from "@/services/admin/customer.service";
import SearchableSelect from "@/components/SearchableSelect";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";

export default function CustomerLogsPage() {
  const [logs, setLogs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    resource: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 20
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });

  // Fetch Customers for the dropdown
  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await CustomerService.getAllCustomers({ limit: 100 });
      if (response && response.data) {
        // Handle different possible response structures
        const customerList = response.data.customers || response.data || [];
        const formattedCustomers = customerList.map(c => ({
          id: c.userId, // We need userId for audit logs
          displayName: `${c.fullName} (${c.customerCode})`
        }));
        setCustomers(formattedCustomers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setToast({ message: "Failed to load customers", type: "error" });
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch Audit Logs
  const fetchLogs = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== "" && v !== null)
      );

      const response = await AuditLogService.getAuditLogs(cleanFilters);

      if (response && response.success) {
        setLogs(response.logs || []);
        setPagination({
          total: response.pagination.total,
          page: response.pagination.page,
          totalPages: response.pagination.totalPages
        });
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setToast({ message: "Failed to load audit logs", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: name === 'page' ? value : 1 // Reset to page 1 only if a non-page filter changes
    }));
  };

  const resetFilters = () => {
    setFilters({
      userId: "",
      action: "",
      resource: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 20
    });
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Action Badge Component
  const ActionBadge = ({ action }) => {
    const actionStyles = {
      LOGIN: "bg-blue-100 text-blue-700 border-blue-200",
      LOGOUT: "bg-gray-100 text-gray-700 border-gray-200",
      CREATE: "bg-green-100 text-green-700 border-green-200",
      UPDATE: "bg-yellow-100 text-yellow-700 border-yellow-200",
      DELETE: "bg-red-100 text-red-700 border-red-200",
      SUBMIT_KYC: "bg-indigo-100 text-indigo-700 border-indigo-200",
      CREATE_DEPOSIT: "bg-emerald-100 text-emerald-700 border-emerald-200",
      CREATE_WITHDRAWAL: "bg-orange-100 text-orange-700 border-orange-200",
    };

    const style = actionStyles[action] || "bg-muted text-muted-foreground border-border";

    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${style}`}>
        {action}
      </span>
    );
  };

  const openLogDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Customer Activity Logs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track all customer actions and system interactions
          </p>
        </div>
        <button
          onClick={() => fetchLogs()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-background border border-input rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          <span className="text-sm font-medium">Refresh Logs</span>
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={18} className="text-primary" />
          <h3 className="font-semibold text-lg">Filter Timeline</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Customer</label>
            <SearchableSelect
              options={customers}
              value={filters.userId}
              onChange={(val) => handleFilterChange("userId", val)}
              placeholder="Search by name or code"
              loading={customersLoading}
            />
          </div>

          {/* Action Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Type</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="VIEW_DASHBOARD">View Dashboard</option>
              <option value="CREATE_DEPOSIT">Submit Deposit</option>
              <option value="CREATE_WITHDRAWAL">Submit Withdrawal</option>
              <option value="SUBMIT_KYC">Submit KYC</option>
              <option value="UPDATE_PROFILE">Update Profile</option>
              <option value="CHANGE_PASSWORD">Change Password</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <RefreshCcw size={12} />
            Reset all filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Time</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">User</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Action</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Resource</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Description</th>
                <th className="px-6 py-4 text-right font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-4">
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground/50" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                          {log.user ? (log.user.firstname?.[0] || log.user.username?.[0] || 'U') : 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-xs">
                            {log.user ? `${log.user.firstname} ${log.user.lastname}` : 'System'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{log.user?.role || 'Service'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-foreground bg-muted px-2 py-1 rounded">
                        {log.resource}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-foreground line-clamp-1">{log.description}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openLogDetails(log)}
                        className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <FileText size={32} className="text-muted-foreground/30" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-foreground">No logs found</h4>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          Could not find any activity logs matching the current filters.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{logs.length}</span> of <span className="font-semibold text-foreground">{pagination.total}</span> logs
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => handleFilterChange("page", pagination.page - 1)}
              className="px-3 py-1.5 text-xs font-medium border border-input rounded-md hover:bg-accent disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1 font-medium text-xs">
              <span className="px-2 py-1 bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
              <span className="text-muted-foreground mx-1">of</span>
              <span>{pagination.totalPages}</span>
            </div>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handleFilterChange("page", pagination.page + 1)}
              className="px-3 py-1.5 text-xs font-medium border border-input rounded-md hover:bg-accent disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Activity Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time</p>
                <p className="text-sm font-medium">{formatDate(selectedLog.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Metadata</p>
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <span className="font-semibold">IP:</span> {selectedLog.clientIp || "Unknown"}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-baseline gap-1">
                    <span className="font-semibold">Agent:</span> <span className="break-all">{selectedLog.userAgent || "Unknown"}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-2 pb-4 border-y border-border">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Action</p>
                <ActionBadge action={selectedLog.action} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resource</p>
                <p className="text-xs font-medium">{selectedLog.resource}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resource ID</p>
                <p className="text-xs font-mono">{selectedLog.resourceId || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</p>
              <div className="bg-muted/50 p-3 rounded-lg border border-border">
                <p className="text-sm text-foreground">{selectedLog.description}</p>
              </div>
            </div>

            {(selectedLog.oldValue || selectedLog.newValue) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Old Values</p>
                  <pre className="p-3 bg-slate-950 text-slate-50 text-[10px] rounded-lg overflow-auto max-h-60 custom-scrollbar">
                    {JSON.stringify(selectedLog.oldValue, null, 2) || "null"}
                  </pre>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">New Values</p>
                  <pre className="p-3 bg-slate-950 text-slate-50 text-[10px] rounded-lg overflow-auto max-h-60 custom-scrollbar">
                    {JSON.stringify(selectedLog.newValue, null, 2) || "null"}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 shadow-md transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--muted-foreground);
        }
      `}</style>
    </div>
  );
}
