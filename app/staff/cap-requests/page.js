"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  ChevronDown,
  RefreshCw,
  Loader2,
  Clock,
  User,
  X
} from "lucide-react";
import capSystemService from "@/services/admin/cap-system.service";
import Toast from "@/components/Toast";

// --- Standard Status Badge ---
const StatusBadge = ({ status }) => {
  let styles = "bg-muted text-muted-foreground border-border";
  const normalizedStatus = status?.toLowerCase() || 'pending';

  if (normalizedStatus === 'approved') styles = "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (normalizedStatus === 'pending') styles = "text-slate-600 bg-slate-100 border-slate-200";
  if (normalizedStatus === 'rejected') styles = "text-rose-600 bg-rose-50 border-rose-100";

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${styles}`}>
      {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
    </span>
  );
};

export default function StaffCapRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState(null);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      if (isRefresh) setRefreshing(true);

      const response = await capSystemService.getAllEmergencyRequests();
      if (response.success) {
        setRequests(response.data || []);
      } else {
        setToast({ message: "Failed to load requests", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching cap requests:", error);
      setToast({ message: "An error occurred while fetching requests", type: "error" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRefresh = () => fetchRequests(true);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
    setAdminNotes("");
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      const response = await capSystemService.updateRequestStatus(selectedRequest.id, { status, adminNotes });
      if (response.success) {
        setToast({ message: `Request ${status} successfully!`, type: "success" });
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status, adminNotes } : r));
        closeModal();
      } else {
        setToast({ message: response.message || `Failed to ${status} request`, type: "error" });
      }
    } catch (error) {
      setToast({ message: `Failed to ${status} request`, type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customer?.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toString().includes(searchTerm);
    const matchesFilter = filter === "All" || req.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading && !refreshing) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Emergency Requests</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-full sm:w-auto p-2 hover:bg-muted rounded-full transition-colors flex items-center justify-center gap-2 border border-border sm:border-none"
        >
          <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customer, ID..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 bg-background border border-input rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-semibold text-[11px] sm:text-[13px]">ID</th>
                <th className="px-4 sm:px-6 py-4 font-semibold text-[11px] sm:text-[13px]">Customer</th>
                <th className="px-4 sm:px-6 py-4 font-semibold text-[11px] sm:text-[13px] text-right">Amount</th>
                <th className="px-4 sm:px-6 py-4 font-semibold text-[11px] sm:text-[13px] hidden md:table-cell">Applied Date</th>
                <th className="px-4 sm:px-6 py-4 font-semibold text-[11px] sm:text-[13px]">Status</th>
                <th className="px-4 sm:px-6 py-4 font-semibold text-[11px] sm:text-[13px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 sm:px-6 py-4 sm:py-5 font-bold text-slate-900 text-[11px] sm:text-[13px]">#{req.id}</td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{req.customer?.fullName || 'N/A'}</span>
                        <span className="text-[9px] sm:text-[11px] text-slate-400 font-medium uppercase mt-0.5">{req.customer?.customerCode || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right font-bold text-amber-600 text-sm sm:text-[15px]">₹{parseFloat(req.amount).toLocaleString('en-IN')}</td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-slate-500 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-300" />
                        <span className="font-medium text-xs">{new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                      <button
                        onClick={() => handleViewDetails(req)}
                        className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold">Verification Details</h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider">Customer Name</label>
                    <p className="text-xs sm:text-sm font-semibold">{selectedRequest.customer?.fullName}</p>
                  </div>
                  <div>
                    <label className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider">Customer Code</label>
                    <p className="text-xs sm:text-sm font-semibold text-primary">{selectedRequest.customer?.customerCode}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider">Amount</label>
                    <p className="text-lg sm:text-xl font-bold text-amber-600">₹ {parseFloat(selectedRequest.amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2 block">Emergency Reason</label>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.proofFile && (
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-3 block">Supporting Document</label>
                  <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50 aspect-video flex items-center justify-center">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SERVER_URL}${selectedRequest.proofFile}`}
                      alt="Proof"
                      className="max-h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {selectedRequest.status.toLowerCase() === 'pending' && (
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Decision Notes</label>
                    <textarea
                      placeholder="Add any verification notes..."
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[100px]"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleUpdateStatus('rejected')}
                      disabled={isProcessing}
                      className="py-3 rounded-xl border border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('approved')}
                      disabled={isProcessing}
                      className="py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? "Processing..." : "Approve"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
