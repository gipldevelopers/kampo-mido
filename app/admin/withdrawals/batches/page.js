"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, FileText, CheckCircle, Loader2, Eye } from "lucide-react";
import adminWithdrawalsService from "../../../../services/admin/withdrawal-request.service";
import Toast from "@/components/Toast";

export default function BatchManagementPage() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [payingBatchId, setPayingBatchId] = useState(null);
    const [toast, setToast] = useState(null);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const res = await adminWithdrawalsService.getBatches();
            if (res.success) {
                setBatches(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching batches:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleCreateBatch = async () => {
        try {
            setCreating(true);
            const res = await adminWithdrawalsService.createBatch();
            if (res.success) {
                setToast({ message: "Batch created successfully", type: "success" });
                fetchBatches();
            }
        } catch (error) {
            setToast({ message: error.response?.data?.message || "Failed to create batch", type: "error" });
        } finally {
            setCreating(false);
        }
    };

    const handleExport = async (batchId) => {
        try {
            const res = await adminWithdrawalsService.exportBatch(batchId);
            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Batch_${batchId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setToast({ message: "Failed to export batch", type: "error" });
        }
    };

    const handlePay = async (batchId) => {
        if (!confirm("Are you sure you want to mark this batch as paid? This will complete all requests.")) return;

        try {
            setPayingBatchId(batchId);
            const res = await adminWithdrawalsService.payBatch(batchId);
            if (res.success) {
                setToast({ message: res.message, type: "success" });
                fetchBatches();
            } else {
                setToast({ message: res.message, type: "warning" });
                fetchBatches();
            }
        } catch (error) {
            setToast({ message: "Failed to pay batch", type: "error" });
        } finally {
            setPayingBatchId(null);
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/withdrawals" className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Batch Processing</h1>
                        <p className="text-sm text-muted-foreground">Manage bulk withdrawal payments</p>
                    </div>
                </div>
                <button
                    onClick={handleCreateBatch}
                    disabled={creating}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Generate New Batch
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <div className="bg-card border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="px-4 py-3">Batch ID</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Requests</th>
                                <th className="px-4 py-3">Total Amount</th>
                                <th className="px-4 py-3">Total Gold</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {batches.length > 0 ? batches.map(batch => (
                                <tr key={batch.id} className="hover:bg-muted/10">
                                    <td className="px-4 py-3 font-medium">#{batch.id}</td>
                                    <td className="px-4 py-3">{new Date(batch.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">{batch.totalRequests}</td>
                                    <td className="px-4 py-3">₹{parseFloat(batch.totalAmount).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-yellow-600 font-medium">{batch.totalGoldDeducted ? `${parseFloat(batch.totalGoldDeducted).toFixed(3)} g` : '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${batch.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                batch.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {batch.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <Link href={`/admin/withdrawals/batches/${batch.id}`}>
                                            <button className="p-2 hover:bg-muted rounded text-muted-foreground mr-1" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        <button onClick={() => handleExport(batch.id)} className="p-2 hover:bg-muted rounded text-blue-600" title="Export Excel">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        {batch.status !== 'paid' && (
                                            <button
                                                onClick={() => handlePay(batch.id)}
                                                disabled={payingBatchId === batch.id}
                                                className="p-2 hover:bg-muted rounded text-green-600 disabled:opacity-50"
                                                title="Mark as Paid"
                                            >
                                                {payingBatchId === batch.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="p-8 text-center text-muted-foreground">No batches found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
