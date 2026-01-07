"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  UserPlus,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Pencil,
  Trash2,
  Eye
} from "lucide-react";
import Toast from "@/components/Toast";
import CustomerService from "@/services/admin/customer.service";
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

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  // Fetch customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await CustomerService.getAllCustomers();

      // Handle response structure: { success: true, data: [...], pagination: {...} }
      if (response.data && Array.isArray(response.data)) {
        // Map API data to UI format
        const mappedCustomers = response.data.map(customer => ({
          id: customer.id,
          name: customer.fullName || "N/A",
          accountNo: customer.accountNumber || customer.customerCode || "N/A",
          mobile: customer.mobile || "N/A",
          deposited: 0, // Not in API response, default to 0
          gold: 0, // Not in API response, default to 0
          kyc: customer.kycStatus ? customer.kycStatus.charAt(0).toUpperCase() + customer.kycStatus.slice(1) : "Pending",
          status: customer.user?.status ? customer.user.status.charAt(0).toUpperCase() + customer.user.status.slice(1) : "Active",
        }));
        setCustomers(mappedCustomers);

        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setCustomers([]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch customers";
      setToast({ message: errorMessage, type: "error" });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.accountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile.includes(searchTerm);

    if (filter === "All") return matchesSearch;
    if (filter === "KYC Pending") return matchesSearch && customer.kyc === "Pending";
    if (filter === "Active") return matchesSearch && customer.status === "Active";
    if (filter === "Inactive") return matchesSearch && customer.status === "Inactive";
    if (filter === "High Balance") return matchesSearch && customer.deposited > 100000;

    return matchesSearch;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Customer Report", 14, 20);

    const tableColumn = ["Name", "Account No", "Mobile", "Deposited", "Gold (g)", "KYC", "Status"];
    const tableRows = filteredCustomers.map(customer => [
      customer.name,
      customer.accountNo,
      customer.mobile,
      `₹ ${customer.deposited.toLocaleString()}`,
      customer.gold,
      customer.kyc,
      customer.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.save("customers_report.pdf");
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    const workSheet = XLSX.utils.json_to_sheet(filteredCustomers.map(customer => ({
      Name: customer.name,
      "Account No": customer.accountNo,
      Mobile: customer.mobile,
      Deposited: customer.deposited,
      "Gold (g)": customer.gold,
      KYC: customer.kyc,
      Status: customer.status
    })));

    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "Customers");

    const excelBuffer = XLSX.write(workBook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(data, "customers_report.xlsx");
    setIsExportOpen(false);
  };

  const handleDelete = async (id, name) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await CustomerService.deleteCustomer(id);

      // Remove customer from state
      setCustomers(prev => prev.filter(c => c.id !== id));
      setToast({ message: `${name} deleted successfully`, type: 'success' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete customer";
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
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Customer Management</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Manage users, KYC status, and accounts.</p>
        </div>
        <Link href="/admin/customers/add" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-all shadow-sm">
            <UserPlus size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Update Customers</span>
          </button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Name, ID, or Mobile..."
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
              <option value="All">All Customers</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="KYC Pending">KYC Pending</option>
              <option value="High Balance">High Balance</option>
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
            <p className="text-sm">Loading customers...</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div key={customer.id} className="p-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <Link href={`/admin/customers/${customer.id}`} className="hover:text-primary transition-colors">
                          <h3 className="font-medium text-sm text-foreground truncate">{customer.name}</h3>
                        </Link>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{customer.accountNo}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link href={`/admin/customers/${customer.id}`}>
                          <button className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                        </Link>
                        <Link href={`/admin/customers/edit/${customer.id}`}>
                          <button className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" title="Edit">
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          disabled={deletingId === customer.id}
                          className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Mobile</p>
                        <p className="text-xs text-foreground">{customer.mobile}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Gold</p>
                        <p className="text-xs text-foreground">{customer.gold} g</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Total Deposited</p>
                        <p className="text-sm font-semibold text-foreground">₹ {customer.deposited.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={customer.kyc} type="kyc" />
                        <StatusBadge status={customer.status} type="account" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No customers found.</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Customer Name</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Account No</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Mobile</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">KYC</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Status</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-foreground">
                          <Link href={`/admin/customers/${customer.id}`} className="hover:text-primary transition-colors">
                            {customer.name}
                          </Link>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">{customer.accountNo}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">{customer.mobile}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4"><StatusBadge status={customer.kyc} type="kyc" /></td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4"><StatusBadge status={customer.status} type="account" /></td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                            <Link href={`/admin/customers/${customer.id}`}>
                              <button className="p-1.5 lg:p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" title="View Details">
                                <Eye size={14} className="lg:w-4 lg:h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(customer.id, customer.name)}
                              disabled={deletingId === customer.id}
                              className="p-1.5 lg:p-2 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Customer"
                            >
                              <Trash2 size={14} className="lg:w-4 lg:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">No customers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div >
  );
}