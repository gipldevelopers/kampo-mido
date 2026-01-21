"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, CheckCircle, Loader2, User, Building, IndianRupee } from "lucide-react";
import adminWithdrawalsService from "../../../../../services/admin/withdrawal-request.service";
import Toast from "@/components/Toast";

export default function BatchDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchBatchDetail = async () => {
        try {
            setLoading(true);
            const res = await adminWithdrawalsService.getBatchDetails(id);
            if (res.success) {
                setBatch(res.data);
            }
        } catch (error) {
            console.error("Error fetching batch:", error);
            setToast({ message: "Failed to load batch details", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchBatchDetail();
        }
    }, [id]);

    const handleExport = async () => {
        try {
            const res = await adminWithdrawalsService.exportBatch(id);
            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Batch_${id}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setToast({ message: "Failed to export batch", type: "error" });
        }
    };

    const handlePay = async () => {
        if (!confirm("Are you sure you want to mark this batch as paid? This will complete all requests.")) return;
        try {
            setIsPaying(true);
            const res = await adminWithdrawalsService.payBatch(id);
            if (res.success) {
                setToast({ message: res.message, type: "success" });
                fetchBatchDetail(); // Refresh to show updated statuses
            } else {
                setToast({ message: res.message, type: "warning" });
                fetchBatchDetail();
            }
        } catch (error) {
            setToast({ message: "Failed to pay batch", type: "error" });
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!batch) {
        return <div className="p-8 text-center">Batch not found</div>;
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 animate-in fade-in">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/withdrawals/batches" className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                            Batch #{batch.id}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${batch.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                                }`}>
                                {batch.status.toUpperCase()}
                            </span>
                        </h1>
                        <p className="text-sm text-muted-foreground">{new Date(batch.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 font-medium text-sm"
                    >
                        <FileText className="w-4 h-4" /> Export Excel
                    </button>
                    {batch.status !== 'paid' && (
                        <button
                            onClick={handlePay}
                            disabled={isPaying}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm disabled:opacity-50"
                        >
                            {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Mark Batch as Paid
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{batch.totalRequests}</p>
                </div>
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">₹{parseFloat(batch.totalAmount).toLocaleString()}</p>
                </div>
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Total Gold Deducted</p>
                    <p className="text-2xl font-bold text-yellow-600">{batch.totalGoldDeducted ? `${parseFloat(batch.totalGoldDeducted).toFixed(3)} g` : '-'}</p>
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b bg-muted/30">
                    <h3 className="font-semibold text-sm">Requests in Batch</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground border-b text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 w-16">#</th>
                                <th className="px-4 py-3">Req ID</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Bank Details</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {batch.requests && batch.requests.length > 0 ? (
                                batch.requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-muted/5">
                                        <td className="px-4 py-3 font-medium text-muted-foreground">{req.serialNumber}</td>
                                        <td className="px-4 py-3">WDR-{req.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{req.customer?.fullName}</span>
                                                <span className="text-xs text-muted-foreground">{req.customer?.customerCode}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {req.customer?.bankDetail ? (
                                                <div className="text-xs space-y-0.5">
                                                    <p className="font-medium">{req.customer.bankDetail.bankName}</p>
                                                    <p className="text-muted-foreground">Generic A/C: {req.customer.bankDetail.accountNumber}</p>
                                                    <p className="text-muted-foreground">IFSC: {req.customer.bankDetail.ifscCode}</p>
                                                </div>
                                            ) : (
                                                <span className="text-red-500 text-xs">No Bank Details</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            ₹{parseFloat(req.amount).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${req.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    req.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                {req.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">No requests in this batch</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
