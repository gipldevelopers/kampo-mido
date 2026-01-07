"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    Filter,
    Download,
    FileText,
    FileSpreadsheet,
    ChevronDown,
    CheckCircle2,
    XCircle,
    Loader2,
    X
} from "lucide-react";
import Toast from "@/components/Toast";
import DepositService from "@/services/admin/deposit.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// --- Components ---
const StatusBadge = ({ status }) => {
    let styles = "bg-muted text-muted-foreground border-border";

    if (status === 'Converted' || status === 'converted') {
        styles = "text-primary bg-primary/10 border-primary/20";
    } else if (status === 'Approved' || status === 'approved') {
        styles = "text-blue-600 bg-blue-50 border-blue-200";
    } else if (status === 'Processing' || status === 'processing') {
        styles = "text-yellow-600 bg-yellow-50 border-yellow-200";
    } else if (status === 'Pending' || status === 'pending') {
        styles = "text-secondary-foreground bg-secondary border-secondary";
    } else if (status === 'Rejected' || status === 'rejected') {
        styles = "text-destructive bg-destructive/10 border-destructive/20";
    }

    const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "Pending";

    return (
        <span className={`px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${styles}`}>
            {displayStatus}
        </span>
    );
};

export default function ApproveDeposits() {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("All");
    const [toast, setToast] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef(null);

    // Modal state for notes
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [modalAction, setModalAction] = useState(null); // 'approve' or 'reject'
    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [notes, setNotes] = useState("");

    // Fetch deposits from API
    const fetchDeposits = async () => {
        setLoading(true);
        try {
            const response = await DepositService.getAllDeposits();

            // Handle different response structures
            let depositsData = [];
            if (response.data && Array.isArray(response.data)) {
                depositsData = response.data;
            } else if (Array.isArray(response)) {
                depositsData = response;
            } else if (response.deposits && Array.isArray(response.deposits)) {
                depositsData = response.deposits;
            }

            // Map API data to UI format
            const mappedDeposits = depositsData.map(deposit => ({
                id: deposit.id || deposit.depositId,
                customerName: deposit.customer?.name || deposit.customerName || deposit.customer?.fullName || "N/A",
                customerId: deposit.customerId || deposit.customer?.id,
                accountNo: deposit.customer?.accountNumber || deposit.accountNumber || deposit.customer?.customerCode || "N/A",
                amount: deposit.amount || 0,
                goldAmount: deposit.goldAmount || deposit.gold || deposit.goldGrams || 0,
                date: deposit.depositDate || deposit.date || deposit.createdAt,
                status: deposit.status || "pending",
                upiReference: deposit.upiReference || deposit.upiRef || "N/A",
                paymentMode: deposit.paymentMode || deposit.mode || "UPI",
                notes: deposit.notes || deposit.adminNotes || "",
                isConverted: deposit.isConverted || deposit.status === "converted" || deposit.status === "Converted" || !!deposit.conversion
            }));

            setDeposits(mappedDeposits);

            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch deposits";
            setToast({ message: errorMessage, type: "error" });
            setDeposits([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    const filteredDeposits = deposits.filter(deposit => {
        const matchesSearch =
            deposit.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deposit.accountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deposit.upiReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deposit.id.toString().includes(searchTerm);

        if (filter === "All") return matchesSearch;
        if (filter === "Pending") return matchesSearch && (deposit.status === "Pending" || deposit.status === "pending");
        if (filter === "Approved") return matchesSearch && (deposit.status === "Approved" || deposit.status === "approved");
        if (filter === "Processing") return matchesSearch && (deposit.status === "Processing" || deposit.status === "processing");
        if (filter === "Converted") return matchesSearch && (deposit.status === "Converted" || deposit.status === "converted");
        if (filter === "Rejected") return matchesSearch && (deposit.status === "Rejected" || deposit.status === "rejected");

        return matchesSearch;
    });

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Approved Deposits Report", 14, 20);

        const tableColumn = ["Customer Name", "Account No", "Amount", "Gold", "Status", "Date", "UPI Reference"];
        const tableRows = filteredDeposits.map(deposit => [
            deposit.customerName,
            deposit.accountNo,
            `₹ ${deposit.amount.toLocaleString()}`,
            `${deposit.goldAmount} g`,
            deposit.status,
            formatDate(deposit.date),
            deposit.upiReference
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
        });

        doc.save("approve_deposits_report.pdf");
        setIsExportOpen(false);
    };

    const exportToExcel = () => {
        const workSheet = XLSX.utils.json_to_sheet(filteredDeposits.map(deposit => ({
            "Customer Name": deposit.customerName,
            "Account No": deposit.accountNo,
            Amount: deposit.amount,
            Gold: deposit.goldAmount,
            Status: deposit.status,
            Date: formatDate(deposit.date),
            "UPI Reference": deposit.upiReference
        })));

        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "Approved Deposits");

        const excelBuffer = XLSX.write(workBook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
        saveAs(data, "approve_deposits_report.xlsx");
        setIsExportOpen(false);
    };

    const openNotesModal = (action, deposit) => {
        setModalAction(action);
        setSelectedDeposit(deposit);
        setNotes("");
        setShowNotesModal(true);
    };

    const closeNotesModal = () => {
        setShowNotesModal(false);
        setModalAction(null);
        setSelectedDeposit(null);
        setNotes("");
    };

    const handleSubmitAction = async () => {
        if (!notes.trim()) {
            setToast({
                message: `Please enter admin notes before ${modalAction === 'approve' ? 'approving' : 'rejecting'} the deposit`,
                type: "error"
            });
            return;
        }

        if (!selectedDeposit) return;

        setProcessingId(selectedDeposit.id);
        closeNotesModal();

        try {
            if (modalAction === 'approve') {
                await DepositService.approveDeposit(selectedDeposit.id, notes.trim());
                setToast({ message: "Deposit approved successfully", type: 'success' });
            } else {
                await DepositService.rejectDeposit(selectedDeposit.id, notes.trim());
                setToast({ message: "Deposit rejected", type: 'error' });
            }
            // Refresh deposits list
            await fetchDeposits();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || `Failed to ${modalAction} deposit`;
            setToast({ message: errorMessage, type: "error" });
        } finally {
            setProcessingId(null);
        }
    };

    const handleApprove = (id, customerName) => {
        const deposit = deposits.find(d => d.id === id);
        if (deposit) {
            openNotesModal('approve', deposit);
        }
    };

    const handleReject = (id, customerName) => {
        const deposit = deposits.find(d => d.id === id);
        if (deposit) {
            openNotesModal('reject', deposit);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Approve Deposits</h2>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Review and approve customer deposit requests.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by Customer, Account No, UPI Ref, or Deposit ID..."
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
                            <option value="All">All Deposits</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Processing">Processing</option>
                            <option value="Converted">Converted</option>
                            <option value="Rejected">Rejected</option>
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
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading deposits...</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-border">
                            {filteredDeposits.length > 0 ? (
                                filteredDeposits.map((deposit) => (
                                    <div key={deposit.id} className="p-3 hover:bg-muted/20 transition-colors">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-sm text-foreground truncate">{deposit.customerName}</h3>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">{deposit.accountNo}</p>
                                            </div>
                                            <StatusBadge status={deposit.status} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">Amount</p>
                                                <p className="text-xs font-semibold text-foreground">₹ {deposit.amount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">Gold</p>
                                                <p className="text-xs text-foreground">{deposit.goldAmount} g</p>
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <p className="text-[10px] text-muted-foreground">Date</p>
                                            <p className="text-xs text-foreground">{formatDate(deposit.date)}</p>
                                        </div>
                                        {(deposit.status === "Pending" || deposit.status === "pending") && !deposit.isConverted && (
                                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                                                <button
                                                    onClick={() => handleReject(deposit.id, deposit.customerName)}
                                                    disabled={processingId === deposit.id}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processingId === deposit.id ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <XCircle size={12} />
                                                    )}
                                                    <span>Reject</span>
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(deposit.id, deposit.customerName)}
                                                    disabled={processingId === deposit.id}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:opacity-90 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processingId === deposit.id ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 size={12} />
                                                    )}
                                                    <span>Approve</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p className="text-sm">No deposits found.</p>
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-xs sm:text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Customer Name</th>
                                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Amount</th>
                                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Date</th>
                                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">UPI Reference</th>
                                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Status</th>
                                        <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredDeposits.length > 0 ? (
                                        filteredDeposits.map((deposit) => (
                                            <tr key={deposit.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-foreground">
                                                    {deposit.customerName}
                                                </td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold">₹ {deposit.amount.toLocaleString()}</td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">{formatDate(deposit.date)}</td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">{deposit.upiReference}</td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4"><StatusBadge status={deposit.status} /></td>
                                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                                                        {(deposit.status === "Pending" || deposit.status === "pending") && !deposit.isConverted ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleReject(deposit.id, deposit.customerName)}
                                                                    disabled={processingId === deposit.id}
                                                                    className="p-1.5 lg:p-2 hover:bg-destructive/10 rounded-md text-destructive hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Reject Deposit"
                                                                >
                                                                    {processingId === deposit.id ? (
                                                                        <Loader2 size={14} className="lg:w-4 lg:h-4 animate-spin" />
                                                                    ) : (
                                                                        <XCircle size={14} className="lg:w-4 lg:h-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleApprove(deposit.id, deposit.customerName)}
                                                                    disabled={processingId === deposit.id}
                                                                    className="p-1.5 lg:p-2 hover:bg-primary/10 rounded-md text-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Approve Deposit"
                                                                >
                                                                    {processingId === deposit.id ? (
                                                                        <Loader2 size={14} className="lg:w-4 lg:h-4 animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle2 size={14} className="lg:w-4 lg:h-4" />
                                                                    )}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">No actions</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">No deposits found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="text-lg font-semibold">
                                {modalAction === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
                            </h3>
                            <button
                                onClick={closeNotesModal}
                                className="p-1 hover:bg-muted rounded-full transition-colors"
                                disabled={processingId === selectedDeposit?.id}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {selectedDeposit && (
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Customer</p>
                                        <p className="text-sm font-medium text-foreground">{selectedDeposit.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Amount</p>
                                        <p className="text-sm font-semibold text-foreground">₹ {selectedDeposit.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Admin Notes <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={modalAction === 'approve' ? 'Enter notes for approval (e.g., Payment verified and approved)' : 'Enter reason for rejection (e.g., Payment verification failed)'}
                                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[100px] resize-y"
                                    disabled={processingId === selectedDeposit?.id}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {modalAction === 'approve'
                                        ? 'Please provide notes explaining why this deposit is being approved.'
                                        : 'Please provide a reason for rejecting this deposit.'}
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={closeNotesModal}
                                    disabled={processingId === selectedDeposit?.id}
                                    className="px-4 py-2 border border-input bg-transparent rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitAction}
                                    disabled={processingId === selectedDeposit?.id || !notes.trim()}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${modalAction === 'approve'
                                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                                        : 'bg-destructive text-destructive-foreground hover:opacity-90'
                                        }`}
                                >
                                    {processingId === selectedDeposit?.id ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {modalAction === 'approve' ? (
                                                <>
                                                    <CheckCircle2 size={14} />
                                                    Approve
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={14} />
                                                    Reject
                                                </>
                                            )}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}