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

// --- Mock Data ---
const initialKYCRequests = [
  { id: "KYC-2001", name: "Rahul Sharma", date: "Today, 10:23 AM", staff: "Admin", status: "Pending", docType: "Aadhaar Card" },
  { id: "KYC-2002", name: "Priya Singh", date: "Yesterday, 4:15 PM", staff: "Manager", status: "Approved", docType: "PAN Card" },
  { id: "KYC-2003", name: "Amit Kumar", date: "01 Dec, 11:00 AM", staff: "Admin", status: "Rejected", docType: "Driving License" },
  { id: "KYC-2004", name: "Sneha Gupta", date: "01 Dec, 09:30 AM", staff: "System", status: "Pending", docType: "Aadhaar Card" },
  { id: "KYC-2005", name: "Vikram Malhotra", date: "30 Nov, 2:00 PM", staff: "Admin", status: "Approved", docType: "Passport" },
];

// --- Components ---
const StatusBadge = ({ status }) => {
  let styles = "bg-muted text-muted-foreground border-border";
  if (status === 'Approved') styles = "text-primary bg-primary/10 border-primary/20";
  if (status === 'Pending') styles = "text-secondary-foreground bg-secondary border-secondary";
  if (status === 'Rejected') styles = "text-destructive bg-destructive/10 border-destructive/20";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
      {status}
    </span>
  );
};

export default function KYCManagement() {
  const [requests, setRequests] = useState(initialKYCRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All"); 
  const [toast, setToast] = useState(null);

  // Dropdown States
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Refs
  const exportRef = useRef(null);

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

  const handleQuickApprove = (id, name) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Approved" } : r));
    setToast({ message: `KYC for ${name} approved successfully`, type: "success" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">KYC Management</h2>
          <p className="text-sm text-muted-foreground">Verify and manage customer identification documents.</p>
        </div>
      </div>

      {/* Toolbar (Styled like Customer Page) */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by Name or KYC ID..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          
          {/* Filter Dropdown */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter size={16} className="text-muted-foreground" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-full pl-9 pr-8 py-2 bg-background border border-input rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
          </div>

          {/* Export Dropdown */}
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
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left">
                    <FileText size={14} /> PDF
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left">
                    <FileSpreadsheet size={14} /> Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Document Type</th>
                <th className="px-6 py-3 font-medium">Upload Date</th>
                <th className="px-6 py-3 font-medium">Assigned Staff</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{req.name}</p>
                        <p className="text-xs text-muted-foreground">{req.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{req.docType}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock size={14} /> {req.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User size={14} /> {req.staff}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === "Pending" && (
                          <button 
                            onClick={() => handleQuickApprove(req.id, req.name)}
                            className="p-2 hover:bg-primary/10 rounded-md text-muted-foreground hover:text-primary transition-colors" 
                            title="Quick Approve"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <Link href={`/admin/kyc/${req.id}`}>
                          <button className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors" title="View Details">
                            <Eye size={16} />
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
      </div>
    </div>
  );
}