"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  ArrowRight,
  Shield,
  Users
} from "lucide-react";
import AuditLogService from "@/services/admin/audit-log.service";
import CustomerService from "@/services/admin/customer.service";
import UserService from "@/services/admin/user.service";
import AdminService from "@/services/admin/admin.service";
import SearchableSelect from "@/components/SearchableSelect";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";

export default function CustomerLogsPage() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
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
    limit: 20,
    role: "customer" // Default role to filter users
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });

  // Fetch Users based on Role
  const fetchUserList = useCallback(async (role) => {
    try {
      setUsersLoading(true);
      setUsers([]); // Clear current list
      
      let formattedUsers = [];
      
      if (role === 'customer') {
        const response = await CustomerService.getAllCustomers({ limit: 100 });
        if (response && response.success) {
          const customerList = response.data || [];
          formattedUsers = customerList.map(c => ({
            id: c.userId,
            displayName: `${c.fullName} (${c.customerCode})`
          }));
        }
      } else {
        // Fetch Admin or Staff using AdminService's get-all
        const response = await AdminService.getAllAdmins({ limit: 100 });
        if (response && response.success) {
          // Backend returns both admins and staff in .data
          const allAdminsAndStaff = response.data || [];
          
          // Filter by selected role (admin or staff)
          const filteredList = allAdminsAndStaff.filter(user => user.role === role);
          
          formattedUsers = filteredList.map(u => ({
            id: u.id,
            displayName: `${u.firstname} ${u.lastname} (${u.email || u.phone})`
          }));
        }
      }
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setToast({ message: `Failed to load ${role} list`, type: "error" });
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Fetch users when component mounts or role changes
  useEffect(() => {
    fetchUserList(filters.role);
  }, [filters.role, fetchUserList]);

  // Fetch Audit Logs
  const fetchLogs = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      // Remove role from filters before sending to API
      const { role, ...apiFilters } = currentFilters;
      const cleanFilters = Object.fromEntries(
        Object.entries(apiFilters).filter(([_, v]) => v !== "" && v !== null)
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
  }, []); // Empty deps to keep reference stable

  useEffect(() => {
    fetchLogs(filters);
  }, [filters, fetchLogs]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [name]: value,
        page: name === 'page' ? value : 1
      };
      
      // If role changes, reset userId
      if (name === 'role') {
        newFilters.userId = "";
      }
      
      return newFilters;
    });
  };

  const resetFilters = () => {
    setFilters({
      userId: "",
      action: "",
      resource: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 20,
      role: "customer"
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
      // Customer Actions
      LOGIN: "bg-blue-100 text-blue-700 border-blue-200",
      LOGOUT: "bg-gray-100 text-gray-700 border-gray-200",
      CREATE_DEPOSIT: "bg-emerald-100 text-emerald-700 border-emerald-200",
      CREATE_WITHDRAWAL: "bg-orange-100 text-orange-700 border-orange-200",
      SUBMIT_KYC: "bg-indigo-100 text-indigo-700 border-indigo-200",
      
      // Admin/Staff Actions
      REGISTER_USER: "bg-purple-100 text-purple-700 border-purple-200",
      UPDATE_USER: "bg-purple-100 text-purple-700 border-purple-200",
      DELETE_USER: "bg-red-100 text-red-700 border-red-200",
      APPROVE_DEPOSIT: "bg-green-100 text-green-700 border-green-200",
      REJECT_DEPOSIT: "bg-red-100 text-red-700 border-red-200",
      PROCESS_DEPOSIT: "bg-blue-100 text-blue-700 border-blue-200",
      APPROVE_KYC: "bg-green-100 text-green-700 border-green-200",
      REJECT_KYC: "bg-red-100 text-red-700 border-red-200",
      REQUEST_REUPLOAD: "bg-yellow-100 text-yellow-700 border-yellow-200",
      UPDATE_GOLD_RATE: "bg-amber-100 text-amber-700 border-amber-200",
      UPDATE_KYC: "bg-indigo-100 text-indigo-700 border-indigo-200",
      VIEW_DASHBOARD: "bg-slate-100 text-slate-700 border-slate-200",
      VIEW_PROFILE: "bg-slate-100 text-slate-700 border-slate-200",
    };

    const style = actionStyles[action] || "bg-muted text-muted-foreground border-border";

    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${style}`}>
        {(action || "UNKNOWN").replace(/_/g, ' ')}
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">System Audit Logs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track activities of customers, admins, and staff
          </p>
        </div>
        <button
          onClick={() => fetchLogs(filters)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-background border border-input rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          <span className="text-sm font-medium">Refresh Logs</span>
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={18} className="text-primary" />
          <h3 className="font-semibold text-lg">Filter Activity</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={12} /> User Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary h-[40px]"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* User Selection */}
          <div className="space-y-1.5 lg:col-span-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} /> Select {filters.role.charAt(0).toUpperCase() + filters.role.slice(1)}
            </label>
            <SearchableSelect
              options={users}
              value={filters.userId}
              onChange={(val) => handleFilterChange("userId", val)}
              placeholder={`Search ${filters.role}`}
              loading={usersLoading}
            />
          </div>

          {/* Action Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={12} /> Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary h-[40px]"
            >
              <option value="">All Actions</option>
              <optgroup label="Authentication">
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="UPDATE_PROFILE">Update Profile</option>
                <option value="CHANGE_PASSWORD">Change Password</option>
              </optgroup>
              <optgroup label="Customer Submissions">
                <option value="CREATE_DEPOSIT">Deposit Request</option>
                <option value="CREATE_WITHDRAWAL">Withdrawal Request</option>
                <option value="SUBMIT_KYC">KYC Submission</option>
              </optgroup>
              <optgroup label="Management Actions">
                <option value="APPROVE_DEPOSIT">Approve Deposit</option>
                <option value="REJECT_DEPOSIT">Reject Deposit</option>
                <option value="PROCESS_DEPOSIT">Process Gold Conversion</option>
                <option value="APPROVE_KYC">Approve KYC</option>
                <option value="REJECT_KYC">Reject KYC</option>
                <option value="REQUEST_REUPLOAD">Request Document Re-upload</option>
                <option value="UPDATE_GOLD_RATE">Update Gold Rate</option>
                <option value="REGISTER_USER">Register User (Admin/Staff)</option>
              </optgroup>
              <optgroup label="Views">
                <option value="VIEW_DASHBOARD">View Dashboard</option>
                <option value="VIEW_PROFILE">View Profile</option>
              </optgroup>
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={12} /> From Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary h-[40px]"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={12} /> To Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary h-[40px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border/50">
          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted"
          >
            <RefreshCcw size={12} />
            Reset all filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Timestamp</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Actor</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Activity</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Target</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Summary</th>
                <th className="px-6 py-4 text-right font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6" className="px-6 py-4">
                      <div className="h-5 bg-muted/50 rounded-md w-full animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium">{formatDate(log.createdAt).split(',')[0]}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDate(log.createdAt).split(',')[1]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                          log.user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                          log.user?.role === 'staff' ? 'bg-blue-100 text-blue-700' : 
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {log.user ? (log.user.firstname?.[0] || 'U') : 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-xs leading-none mb-1">
                            {log.user ? `${log.user.firstname} ${log.user.lastname}` : 'System Agent'}
                          </p>
                          <p className={`text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded leading-none w-fit ${
                            log.user?.role === 'admin' ? 'bg-purple-50 text-purple-600' : 
                            log.user?.role === 'staff' ? 'bg-blue-50 text-blue-600' : 
                            'bg-muted text-muted-foreground'
                          }`}>
                            {log.user?.role || 'Service'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground">{log.resource}</span>
                        <span className="text-[9px] font-mono text-muted-foreground lowercase">#{log.resourceId || 'sys'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">{log.description}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openLogDetails(log)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-32 text-center bg-muted/5">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-20 h-20 bg-muted/20 border-2 border-dashed border-muted rounded-full flex items-center justify-center">
                        <FileText size={36} className="text-muted-foreground/20" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg text-foreground">Activity Timeline Empty</h4>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          We couldn't find any activities registered for these filters. Try expanding your search or selecting a different user.
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
        <div className="px-6 py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
          <p className="text-xs font-medium text-muted-foreground">
            Displaying <span className="text-foreground font-bold">{logs.length}</span> of <span className="text-foreground font-bold">{pagination.total}</span> recorded events
          </p>
          <div className="flex items-center gap-3">
            <button
              disabled={pagination.page <= 1}
              onClick={() => handleFilterChange("page", pagination.page - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-input rounded-lg hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm bg-background"
            >
              Previous
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg shadow-inner">
              <span className="text-xs font-bold text-primary">{pagination.page}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">/</span>
              <span className="text-xs font-bold text-muted-foreground">{pagination.totalPages}</span>
            </div>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handleFilterChange("page", pagination.page + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-input rounded-lg hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm bg-background"
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
        title={
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
              <Clock size={16} className="text-primary" />
            </div>
            <span className="font-bold text-base md:text-lg tracking-tight">Activity Trace</span>
          </div>
        }
        size="lg"
      >
        {selectedLog && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Scrollable Content Area */}
            <div className="max-h-[65vh] md:max-h-[75vh] overflow-y-auto pr-1 md:pr-4 custom-scrollbar space-y-4 md:space-y-6 pt-1 md:pt-2">
              
              {/* Top Identity Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 pb-4 md:pb-6 border-b border-border/60">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-xl md:text-2xl shadow-lg border border-white/20 ${
                    selectedLog.user?.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' : 
                    selectedLog.user?.role === 'staff' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 
                    'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                  }`}>
                    {selectedLog.user ? (selectedLog.user.firstname?.[0] || 'U') : 'S'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg md:text-2xl font-black tracking-tight text-foreground leading-tight truncate">
                      {selectedLog.user ? `${selectedLog.user.firstname} ${selectedLog.user.lastname}` : 'System Service'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                         selectedLog.user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                         selectedLog.user?.role === 'staff' ? 'bg-blue-100 text-blue-700' : 
                         'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedLog.user?.role || 'SYSTEM'}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">ID: {selectedLog.userId || 'SERVICE'}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col md:text-right bg-muted/40 md:bg-transparent p-3 md:p-0 rounded-xl border border-border/40 md:border-0">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 opacity-60">Timestamp</p>
                  <p className="text-xs md:text-sm font-black text-foreground">{formatDate(selectedLog.createdAt)}</p>
                  <div className="flex items-center md:justify-end gap-1.5 mt-1 text-[9px] text-primary font-black uppercase tracking-widest">
                    <Globe size={10} className="shrink-0" />
                    <span className="truncate max-w-[150px]">{selectedLog.clientIp || "Direct"}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 md:p-5 bg-card/50 rounded-xl border border-border/80 shadow-sm">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Zap size={10} className="text-primary shrink-0" /> Action
                  </p>
                  <div className="flex flex-wrap">
                    <ActionBadge action={selectedLog.action} />
                  </div>
                </div>
                <div className="p-3 md:p-5 bg-card/50 rounded-xl border border-border/80 shadow-sm">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                    <FileText size={10} className="text-primary shrink-0" /> Resource 
                  </p>
                  <p className="text-xs md:text-sm font-black text-foreground tracking-tight truncate">{selectedLog.resource}</p>
                </div>
                <div className="p-3 md:p-5 bg-card/50 rounded-xl border border-border/80 shadow-sm">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Search size={10} className="text-primary shrink-0" /> Trace ID
                  </p>
                  <p className="text-[10px] md:text-xs font-mono font-black text-foreground truncate select-all">#{selectedLog.resourceId || "sys-trace"}</p>
                </div>
              </div>

              {/* Description Narrative */}
              <div className="space-y-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Description</p>
                <div className="bg-primary/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-primary/20 shadow-sm relative overflow-hidden group">
                  <blockquote className="text-xs md:text-base text-foreground/90 leading-relaxed font-bold italic relative z-10">
                    "{selectedLog.description}"
                  </blockquote>
                  <div className="absolute -top-4 -right-4 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                    <FileText size={64} />
                  </div>
                </div>
              </div>

              {/* Infrastructure Context */}
              <div className="space-y-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Infrastructure</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-muted px-3 py-2.5 rounded-xl border border-border shadow-inner">
                      <p className="text-[8px] font-black text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                        <Shield size={9} className="text-primary" /> Session Address
                      </p>
                      <p className="text-[10px] md:text-sm font-mono font-black text-foreground break-all leading-none">{selectedLog.clientIp || "Internal"}</p>
                    </div>
                    <div className="bg-muted px-3 py-2.5 rounded-xl border border-border shadow-inner min-w-0">
                      <p className="text-[8px] font-black text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                        <Globe size={9} className="text-primary" /> User Agent
                      </p>
                      <p className="text-[9px] md:text-[10px] font-mono text-muted-foreground italic break-words line-clamp-3 leading-tight" title={selectedLog.userAgent}>
                        {selectedLog.userAgent || "System Task Agent"}
                      </p>
                    </div>
                </div>
              </div>

              {/* Change Data - Fixed Scroll within Container */}
              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3 px-1">
                    <span className="text-[9px] font-black text-foreground uppercase tracking-[0.4em] shrink-0">Data Diff</span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 via-border/10 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
                    <div className="space-y-1.5">
                      <p className="text-[8px] font-black text-red-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"></div> Legacy Image
                      </p>
                      <pre className="p-3 bg-slate-950 text-slate-300 text-[10px] md:text-xs rounded-xl overflow-auto max-h-[300px] custom-scrollbar border border-slate-800 font-mono leading-relaxed">
                        {selectedLog.oldValue ? JSON.stringify(selectedLog.oldValue, null, 2) : "// Nil state"}
                      </pre>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div> New Image
                      </p>
                      <pre className="p-3 bg-slate-950 text-slate-300 text-[10px] md:text-xs rounded-xl overflow-auto max-h-[300px] custom-scrollbar border border-slate-800 font-mono leading-relaxed">
                        {selectedLog.newValue ? JSON.stringify(selectedLog.newValue, null, 2) : "// Nil state"}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky/Fixed Footer Action Container */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 md:pt-6 border-t border-border/40 mt-auto bg-background">
              <div className="flex items-center gap-2 bg-muted/30 p-2 md:p-3 rounded-lg border border-border/30 w-full md:w-auto">
                <Info size={14} className="text-primary shrink-0" />
                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground leading-tight">
                  Audit record immutable. Authenticity verified.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full md:w-auto px-10 py-3.5 bg-foreground text-background rounded-xl font-black uppercase tracking-[0.25em] text-[10px] hover:bg-foreground/90 transition-all active:scale-[0.97] shadow-xl shrink-0"
              >
                Close Trace
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(124, 58, 237, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(124, 58, 237, 0.4);
        }
        pre {
          scrollbar-width: thin;
          scrollbar-color: rgba(124, 58, 237, 0.2) transparent;
        }
      `}</style>
    </div>
  );
}

// Optimized icons
function Zap({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function Globe({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function Info({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}