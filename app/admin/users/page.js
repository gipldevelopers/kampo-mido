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
  Pencil,
  Trash2,
  Eye
} from "lucide-react";
import Toast from "@/components/Toast";
import UserService from "@/services/admin/user.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// --- Components ---
const StatusBadge = ({ status, type }) => {
  let styles = "bg-muted text-muted-foreground border-border";

  if (type === 'kyc') {
    if (status === 'Verified') styles = "text-primary bg-primary/10 border-primary/20";
    if (status === 'Pending') styles = "text-secondary-foreground bg-secondary border-secondary";
    if (status === 'Rejected') styles = "text-destructive bg-destructive/10 border-destructive/20";
  } else if (type === 'account') {
    if (status === 'Active') styles = "text-primary bg-primary/10 border-primary/20";
    if (status === 'Inactive') styles = "text-muted-foreground bg-muted border-border";
  }

  return (
    <span className={`px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${styles}`}>
      {status}
    </span>
  );
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term to reduce API calls and server load
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [totalResults, setTotalResults] = useState(0);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
      };

      // Map UI filters to backend params
      if (filter === "Active") params.status = "active";
      if (filter === "Inactive") params.status = "inactive";

      const response = await UserService.getAllUsers(params);

      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
        if (response.pagination) {
          setTotalResults(response.pagination.total);
        } else {
          setTotalResults(response.data.length);
        }
      } else if (response.data && response.data.users) {
        setUsers(response.data.users);
        setTotalResults(response.pagination?.total || response.data.users.length);
      } else if (response.users) {
        setUsers(response.users);
        setTotalResults(response.pagination?.total || response.users.length);
      } else {
        setUsers([]);
        setTotalResults(0);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch users";
      setToast({ message: errorMessage, type: "error" });
      setUsers([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearchTerm, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filter]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format user name from firstname and lastname
  const getUserName = (user) => {
    if (user.name) return user.name;
    if (user.firstname || user.lastname) {
      return `${user.firstname || ""} ${user.lastname || ""}`.trim();
    }
    return "N/A";
  };

  // Format user email
  const getUserEmail = (user) => {
    return user.email || "N/A";
  };

  // Format user phone
  const getUserPhone = (user) => {
    return user.phone || user.mobile || "N/A";
  };

  // Format user role
  const getUserRole = (user) => {
    return user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "N/A";
  };

  // Format user status
  const getUserStatus = (user) => {
    if (!user.status) return "Inactive";
    return user.status.charAt(0).toUpperCase() + user.status.slice(1);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("User Report", 14, 20);

    const tableColumn = ["Name", "Email", "Phone", "Role", "Status"];
    const tableRows = users.map(user => [
      getUserName(user),
      getUserEmail(user),
      getUserPhone(user),
      getUserRole(user),
      getUserStatus(user)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.save("users_report.pdf");
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    const workSheet = XLSX.utils.json_to_sheet(users.map(user => ({
      Name: getUserName(user),
      Email: getUserEmail(user),
      Phone: getUserPhone(user),
      Role: getUserRole(user),
      Status: getUserStatus(user)
    })));

    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "Users");

    const excelBuffer = XLSX.write(workBook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(data, "users_report.xlsx");
    setIsExportOpen(false);
  };

  // Server-side filtering is now used, so we use users directly
  const paginatedUsers = users;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const handleDelete = async (id, name) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await UserService.deleteUser(id);

      // Remove user from state
      setUsers(prev => prev.filter(u => u.id !== id));
      setToast({ message: `${name} deleted successfully`, type: 'success' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete user";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">User Management</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Manage users, roles, and permissions.</p>
        </div>
        <Link href="/admin/users/add" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-all shadow-sm">
            <Plus size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Add New User</span>
          </button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Name, Email, or Role..."
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
              <option value="All">All Users</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
                  <button onClick={exportToPDF} className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-muted text-left"><FileText size={12} className="sm:w-3.5 sm:h-3.5" /> PDF</button>
                  <button onClick={exportToExcel} className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-muted text-left"><FileSpreadsheet size={12} className="sm:w-3.5 sm:h-3.5" /> Excel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg sm:rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">Loading users...</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <div key={user.id} className="p-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <Link href={`/admin/users/${user.id}`} className="hover:text-primary transition-colors">
                          <h3 className="font-medium text-sm text-foreground truncate">{getUserName(user)}</h3>
                        </Link>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{getUserEmail(user)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link href={`/admin/users/${user.id}`}>
                          <button className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                        </Link>
                        <Link href={`/admin/users/edit/${user.id}`}>
                          <button className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" title="Edit">
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id, getUserName(user))}
                          disabled={deletingId === user.id}
                          className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Phone</p>
                        <p className="text-xs text-foreground">{getUserPhone(user)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Role</p>
                        <p className="text-xs text-foreground">{getUserRole(user)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <StatusBadge status={getUserStatus(user)} type="account" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No users found.</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Name</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Email</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Phone</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Role</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Status</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-foreground">
                          <Link href={`/admin/users/${user.id}`} className="hover:text-primary transition-colors">
                            {getUserName(user)}
                          </Link>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">{getUserEmail(user)}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">{getUserPhone(user)}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">{getUserRole(user)}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4"><StatusBadge status={getUserStatus(user)} type="account" /></td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                            <Link href={`/admin/users/${user.id}`}>
                              <button className="p-1.5 lg:p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" title="View Details">
                                <Eye size={14} className="lg:w-4 lg:h-4" />
                              </button>
                            </Link>
                            <Link href={`/admin/users/edit/${user.id}`}>
                              <button className="p-1.5 lg:p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" title="Edit User">
                                <Pencil size={14} className="lg:w-4 lg:h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(user.id, getUserName(user))}
                              disabled={deletingId === user.id}
                              className="p-1.5 lg:p-2 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete User"
                            >
                              <Trash2 size={14} className="lg:w-4 lg:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalResults > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-sm mt-4">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, totalResults)}</span> of <span className="font-medium text-foreground">{totalResults}</span> results
          </div>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border text-xs sm:text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  totalPages <= 5 ||
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-all ${currentPage === pageNum
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted border border-transparent hover:border-border"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  (pageNum === currentPage - 2 && pageNum > 1) ||
                  (pageNum === currentPage + 2 && pageNum < totalPages)
                ) {
                  return <span key={pageNum} className="text-muted-foreground px-1">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border text-xs sm:text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}