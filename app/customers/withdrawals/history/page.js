"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Filter,
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Calendar,
    Wallet,
    Coins,
    Gem,
    MoreVertical,
    Eye,
    X
} from "lucide-react";
import withdrawalsService from "../../../../services/customer/withdrawal.service";
import Toast from "@/components/Toast";

// Status Badge Component
const StatusBadge = ({ status }) => {
    const styles = {
        pending: "text-amber-600 bg-amber-500/10 border-amber-500/20",
        approved: "text-blue-600 bg-blue-500/10 border-blue-500/20",
        processing: "text-purple-600 bg-purple-500/10 border-purple-500/20",
        completed: "text-green-600 bg-green-500/10 border-green-500/20",
        rejected: "text-red-600 bg-red-500/10 border-red-500/20",
        cancelled: "text-gray-600 bg-gray-500/10 border-gray-500/20",
    };

    const icons = {
        pending: Clock,
        approved: CheckCircle2,
        processing: Loader2,
        completed: CheckCircle2,
        rejected: XCircle,
        cancelled: X,
    };

    const Icon = icons[status] || Clock;
    const statusKey = status?.toLowerCase() || 'pending';
    const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${styles[statusKey] || styles.pending}`}>
            <Icon size={12} className={statusKey === 'processing' ? 'animate-spin' : ''} />
            {label}
        </span>
    );
};

// Type Badge Component
const TypeBadge = ({ type }) => {
    const config = {
        money: { icon: Wallet, label: "Money Payout", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
        gold: { icon: Coins, label: "Physical Gold", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
        jewellery: { icon: Gem, label: "Jewellery", color: "text-purple-600 bg-purple-500/10 border-purple-500/20" }
    };

    const normalizedType = type === 'physical' ? 'gold' : type;
    const { icon: Icon, label, color } = config[normalizedType] || config.money;

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit ${color}`}>
            <Icon size={12} />
            {label}
        </span>
    );
};

export default function WithdrawalHistoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);
    const [toast, setToast] = useState(null);

    // Pagination & Filters state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all'
    });

    // Fetch History
    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await withdrawalsService.getWithdrawalHistory(
                page,
                limit,
                filters.type === 'all' ? null : filters.type,
                filters.status === 'all' ? null : filters.status
            );

            if (response.success) {
                setHistory(response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
            } else {
                setHistory([]);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            setToast({
                message: "Failed to load withdrawal history",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [page, filters]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page on filter change
    };

    // Format Helper
    const formatValue = (item) => {
        if (item.type === 'money') {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(item.amount);
        }
        return `${parseFloat(item.grams).toFixed(4)} g`;
    };

    return (
        <div className="min-h-screen pb-10 animate-in fade-in duration-500">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                <div className="flex items-start gap-3">
                    <button
                        onClick={() => router.back()}
                        className="mt-1 p-2 hover:bg-muted rounded-full transition-colors border border-border"
                    >
                        <ArrowLeft size={20} className="text-muted-foreground" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Withdrawal History</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            View and track all your past withdrawal requests and their status.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Mobile Filter Toggle could go here if needed, keeping it simple for now */}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border">
                            <Filter size={16} className="text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Filters:</span>
                        </div>

                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/50"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/50"
                        >
                            <option value="all">All Types</option>
                            <option value="money">Money Payout</option>
                            <option value="gold">Physical Gold</option>
                            <option value="jewellery">Jewellery</option>
                        </select>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{history.length}</span> results
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading history...</p>
                </div>
            ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-xl">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <Search size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">No withdrawals found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters or request a new withdrawal.</p>
                    <button
                        onClick={() => handleFilterChange('status', 'all')}
                        className="mt-4 text-primary hover:underline text-sm font-medium"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date & ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount/Value</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {history.map((item) => (
                                    <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">{item.date}</span>
                                                <span className="text-xs text-muted-foreground font-mono mt-0.5">#{item.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <TypeBadge type={item.type} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-foreground">{formatValue(item)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                {item.address || item.pickupLocation || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Placeholder for future actions like View Details or Cancel */}
                                                <button className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {history.map((item) => (
                            <div key={item.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar size={14} />
                                        <span>{item.date}</span>
                                    </div>
                                    <TypeBadge type={item.type} />
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Amount</span>
                                        <span className="text-lg font-bold text-foreground">{formatValue(item)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-muted-foreground block mb-1">Status</span>
                                        <StatusBadge status={item.status} />
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm bg-muted/30 p-3 rounded-lg">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Reference ID</span>
                                        <span className="font-mono text-foreground">#{item.id}</span>
                                    </div>
                                    {(item.address || item.pickupLocation) && (
                                        <div className="flex justify-between pt-1 border-t border-border/50 mt-1">
                                            <span className="text-muted-foreground">{item.address ? "Delivery" : "Pickup"}</span>
                                            <span className="text-foreground max-w-[60%] text-right truncate">
                                                {item.address || item.pickupLocation}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
