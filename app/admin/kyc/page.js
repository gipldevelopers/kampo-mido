"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Eye, 
  MoreHorizontal,
  Clock,
  User,
  FileCheck,
  ChevronDown,
  Check,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import Toast from "@/components/Toast";
import AdminKYCService from "@/services/admin/admin-kyc.service";

// --- Components ---
const StatusBadge = ({ status }) => {
  let styles = "bg-muted text-muted-foreground border-border";
  if (status === 'Approved') styles = "text-primary bg-primary/10 border-primary/20";
  if (status === 'Pending') styles = "text-secondary-foreground bg-secondary border-secondary";
  if (status === 'Rejected') styles = "text-destructive bg-destructive/10 border-destructive/20";

  return (
    <span className={`px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${styles}`}>
      {status}
    </span>
  );
};

export default function KYCManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All"); 
  const [toast, setToast] = useState(null);

  // Dropdown States
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Refs
  const exportRef = useRef(null);

  // Fetch KYC requests
  useEffect(() => {
    const fetchKYCRequests = async () => {
      setLoading(true);
      try {
        const status = filter === "All" ? null : filter.toLowerCase();
        const response = await AdminKYCService.getAllKYC({
          status,
          page: 1,
          limit: 50,
        });

        // Handle different response structures
        let kycList = [];
        if (response.data && Array.isArray(response.data)) {
          kycList = response.data;
        } else if (response.kyc && Array.isArray(response.kyc)) {
          kycList = response.kyc;
        } else if (Array.isArray(response)) {
          kycList = response;
        }

        // Debug: Log the response to understand structure
        if (kycList.length > 0) {
          console.log("KYC List Sample:", kycList[0]);
        }

        // Map API data to UI format
        const mappedRequests = kycList.map((kyc) => {
          // Prioritize KYC ID, fallback to customerId if needed
          // The API endpoint /admin/kyc/view/{id} expects the KYC record ID
          const kycId = kyc.id || kyc.kycId;
          const customerId = kyc.customerId || kyc.customer?.id;
          
          // Use KYC ID as primary identifier for the detail page
          const displayId = kycId || customerId;
          
          return {
            id: displayId ? String(displayId) : "N/A",
            kycId: kycId ? String(kycId) : null,
            customerId: customerId ? String(customerId) : null,
            name: kyc.customer?.fullName || kyc.fullName || kyc.name || "N/A",
            date: kyc.createdAt ? new Date(kyc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A",
            staff: kyc.assignedStaff || kyc.staff || "Admin",
            status: kyc.status ? kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1) : "Pending",
            docType: kyc.idType || kyc.documentType || "Aadhaar Card",
          };
        });

        setRequests(mappedRequests);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch KYC requests";
        setToast({ message: errorMessage, type: "error" });
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKYCRequests();
  }, [filter]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "All") return matchesSearch;
    return matchesSearch && req.status === filter;
  });

  const handleQuickApprove = async (id, name) => {
    try {
      await AdminKYCService.updateKYCStatus(id, "approved", "Quick approved by admin");
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Approved" } : r));
      setToast({ message: `KYC for ${name} approved successfully`, type: "success" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to approve KYC";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">KYC Management</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Verify and manage customer identification documents.</p>
        </div>
      </div>

      {/* Toolbar (Styled like Customer Page) */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-sm">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by Name or KYC ID..." 
            className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          
          {/* Filter Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter size={14} className="sm:w-4 sm:h-4 text-muted-foreground" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto h-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary sm:min-w-[150px]"
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={12} className="sm:w-3.5 sm:h-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="h-full flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-xs sm:text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <Download size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">Export</span>
            </button>
            
            {isExportOpen && (
              <div className="absolute right-0 top-11 sm:top-12 w-36 sm:w-40 bg-card text-card-foreground border border-border rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-muted text-left">
                    <FileText size={12} className="sm:w-3.5 sm:h-3.5" /> PDF
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-muted text-left">
                    <FileSpreadsheet size={12} className="sm:w-3.5 sm:h-3.5" /> Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Section - Mobile Card View / Desktop Table View */}
      <div className="bg-card rounded-lg sm:rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">Loading KYC requests...</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div key={req.id} className="p-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-foreground truncate">{req.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{req.id}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {req.status === "Pending" && (
                      <button 
                        onClick={() => handleQuickApprove(req.id, req.name)}
                        className="p-1.5 hover:bg-primary/10 rounded-md text-muted-foreground hover:text-primary transition-colors" 
                        title="Quick Approve"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    <Link href={`/admin/kyc/${req.id}`}>
                      <button className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors" title="View">
                        <Eye size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Document</p>
                    <p className="text-xs text-foreground">{req.docType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Staff</p>
                    <div className="flex items-center gap-1">
                      <User size={10} className="text-muted-foreground" />
                      <p className="text-xs text-foreground">{req.staff}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground">{req.date}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No KYC requests found.</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Customer</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Document Type</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Upload Date</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Status</th>
                <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <div>
                        <p className="font-medium text-foreground">{req.name}</p>
                        <p className="text-xs text-muted-foreground">{req.id}</p>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">{req.docType}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="lg:w-4 lg:h-4" /> {req.date}
                      </div>
                    </td>
                    
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                        {req.status === "Pending" && (
                          <button 
                            onClick={() => handleQuickApprove(req.id, req.name)}
                            className="p-1.5 lg:p-2 hover:bg-primary/10 rounded-md text-muted-foreground hover:text-primary transition-colors" 
                            title="Quick Approve"
                          >
                            <CheckCircle2 size={14} className="lg:w-4 lg:h-4" />
                          </button>
                        )}
                        <Link href={`/admin/kyc/${req.id}`}>
                          <button className="p-1.5 lg:p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors" title="View Details">
                            <Eye size={14} className="lg:w-4 lg:h-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                    No KYC requests found.
                  </td>
                </tr>
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