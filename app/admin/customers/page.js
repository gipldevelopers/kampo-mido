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
  Check,
  Pencil,
  Trash2,
  Eye
} from "lucide-react";
import Toast from "@/components/Toast";

// --- Mock Data ---
const initialData = [
  { id: 1, name: "Rahul Sharma", accountNo: "KM-1001", mobile: "+91 98765 43210", deposited: 125000, gold: 12.5, kyc: "Verified", status: "Active" },
  { id: 2, name: "Priya Singh", accountNo: "KM-1002", mobile: "+91 98765 43211", deposited: 50000, gold: 5.0, kyc: "Pending", status: "Active" },
  { id: 3, name: "Amit Kumar", accountNo: "KM-1003", mobile: "+91 98765 43212", deposited: 0, gold: 0, kyc: "Rejected", status: "Inactive" },
  { id: 4, name: "Sneha Gupta", accountNo: "KM-1004", mobile: "+91 98765 43213", deposited: 200000, gold: 24.5, kyc: "Verified", status: "Active" },
  { id: 5, name: "Vikram Malhotra", accountNo: "KM-1005", mobile: "+91 98765 43214", deposited: 75000, gold: 8.2, kyc: "Pending", status: "Active" },
];

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
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
      {status}
    </span>
  );
};

export default function CustomerManagement() {
  const [customers, setCustomers] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All"); 
  const [toast, setToast] = useState(null); 
  
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

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

  const handleDelete = (id, name) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setToast({ message: `${name} deleted successfully`, type: 'success' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Customer Management</h2>
          <p className="text-sm text-muted-foreground">Manage users, KYC status, and accounts.</p>
        </div>
        <Link href="/admin/customers/add">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-all shadow-sm">
            <Plus size={16} /> Add Customer
          </button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by Name, ID, or Mobile..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter size={16} className="text-muted-foreground" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-full pl-9 pr-8 py-2 bg-background border border-input rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
            >
              <option value="All">All Customers</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="KYC Pending">KYC Pending</option>
              <option value="High Balance">High Balance</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
          </div>

          <div className="relative" ref={exportRef}>
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="h-full flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-sm font-medium hover:bg-muted/80 transition-colors">
              <Download size={16} /> Export
            </button>
            {isExportOpen && (
              <div className="absolute right-0 top-12 w-40 bg-card text-card-foreground border border-border rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left"><FileText size={14} /> PDF</button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left"><FileSpreadsheet size={14} /> Excel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Customer Name</th>
                <th className="px-6 py-3 font-medium">Account No</th>
                <th className="px-6 py-3 font-medium">Mobile</th>
                <th className="px-6 py-3 font-medium">Total Deposited</th>
                <th className="px-6 py-3 font-medium">Gold (g)</th>
                <th className="px-6 py-3 font-medium">KYC</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <Link href={`/admin/customers/${customer.id}`} className="hover:text-primary transition-colors">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{customer.accountNo}</td>
                    <td className="px-6 py-4">{customer.mobile}</td>
                    <td className="px-6 py-4 font-semibold">₹ {customer.deposited.toLocaleString()}</td>
                    <td className="px-6 py-4">{customer.gold} g</td>
                    <td className="px-6 py-4"><StatusBadge status={customer.kyc} type="kyc" /></td>
                    <td className="px-6 py-4"><StatusBadge status={customer.status} type="account" /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* New View Button */}
                        <Link href={`/admin/customers/${customer.id}`}>
                          <button className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                        </Link>
                        <Link href={`/admin/customers/edit/${customer.id}`}>
                          <button className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" title="Edit Customer">
                            <Pencil size={16} />
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(customer.id, customer.name)} className="p-2 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors" title="Delete Customer">
                          <Trash2 size={16} />
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
      </div>
    </div>
  );
}