"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tag,
  Plus,
  Search,
  Send,
  Users,
  Calendar,
  Percent,
  Coins,
  MoreVertical,
  CheckCircle2,
  Filter,
  Check,
  X,
  Edit,
  Loader2
} from "lucide-react";
import Toast from "@/components/Toast";
import OfferService from "@/services/admin/offers.service";

// --- Components ---

const StatusBadge = ({ status }) => {
  const styles = status === 'active'
    ? "text-green-600 bg-green-50 border-green-200"
    : "text-muted-foreground bg-muted border-border";

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${styles}`}>
      {status}
    </span>
  );
};

const DiscountIcon = ({ type }) => {
  switch (type) {
    case 'percentage': return <Percent size={14} className="text-blue-500" />;
    case 'amount': return <Tag size={14} className="text-green-500" />;
    case 'extra_gold': return <Coins size={14} className="text-amber-500" />;
    default: return <Tag size={14} />;
  }
};

export default function OfferManagement() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Send Targets state
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await OfferService.getAllOffers();
      setOffers(response.data || []);
    } catch (error) {
      setToast({ message: error.response?.data?.message || "Failed to fetch offers. Please check if backend is running and prisma is generated.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await OfferService.getCustomersForSelection();
      const customerData = response.customers || response.data || [];
      setCustomers(customerData);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCustomers();
  }, []);

  const handleBroadcast = async () => {
    if (!selectedOffer) return;
    setSubmitting(true);
    try {
      const result = await OfferService.broadcastToAll(selectedOffer.id);
      setToast({ message: result.message || "Broadcast successful", type: "success" });
      setIsBroadcastModalOpen(false);
    } catch (error) {
      setToast({ message: error.response?.data?.message || "Broadcast failed", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendToSelected = async () => {
    if (!selectedOffer || selectedCustomerIds.length === 0) return;
    setSubmitting(true);
    try {
      const result = await OfferService.sendToSelected(selectedOffer.id, selectedCustomerIds);
      setToast({ message: result.message || "Messages sent successfully", type: "success" });
      setIsTargetModalOpen(false);
      setSelectedCustomerIds([]);
    } catch (error) {
      setToast({ message: error.response?.data?.message || "Failed to send messages", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleOfferStatus = async (offer) => {
    const newStatus = offer.status === 'active' ? 'inactive' : 'active';
    try {
      await OfferService.toggleStatus(offer.id, newStatus);
      setOffers(offers.map(o => o.id === offer.id ? { ...o, status: newStatus } : o));
      setToast({ message: `Offer marked as ${newStatus}`, type: "success" });
    } catch (error) {
      setToast({ message: "Failed to update status", type: "error" });
    }
  };

  const filteredOffers = offers.filter(o =>
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.mobile.includes(customerSearch)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="text-primary w-5 h-5 sm:w-6 sm:h-6" /> Offer Management
          </h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
            Create and broadcast promotional offers to your customers.
          </p>
        </div>
        <Link
          href="/admin/offers/add"
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Create New Offer</span>
        </Link>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Total Offers", value: offers.length, icon: Tag, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Offers", value: offers.filter(o => o.status === 'active').length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Total Redemptions", value: offers.reduce((acc, curr) => acc + (curr.usesCount || 0), 0), icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-4 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4">
            <div className={`p-2 sm:p-3 rounded-md sm:rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5">{stat.label}</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4 bg-card rounded-lg sm:rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search offers by title or code..."
            className="w-full pl-10 pr-4 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select className="pl-9 pr-8 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm font-medium appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-primary transition-all">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Offers Table/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-card/50 animate-pulse rounded-2xl border border-dashed border-border" />
          ))
        ) : filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => (
            <div key={offer.id} className="group bg-card border border-border rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col relative">
              <div className="p-4 sm:p-5 md:p-6 flex-1">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 text-primary transition-all duration-300">
                    <DiscountIcon type={offer.discountType} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase border ${
                      offer.applicableTo === 'deposit' ? 'border-blue-200 bg-blue-50 text-blue-600' :
                      offer.applicableTo === 'withdrawal' ? 'border-amber-200 bg-amber-50 text-amber-600' :
                      'border-purple-200 bg-purple-50 text-purple-600'
                    }`}>
                      {offer.applicableTo}
                    </span>
                    <StatusBadge status={offer.status} />
                    <Link
                      href={`/admin/offers/edit/${offer.id}`}
                      className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary"
                      title="Edit Offer"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => toggleOfferStatus(offer)}
                      className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                      title="Toggle Status"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-1">{offer.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-4 h-8 leading-tight">{offer.description || "No description provided."}</p>

                <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl border border-border/50 mb-4 sm:mb-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-tight mb-0.5">Coupon Code</span>
                    <span className="text-sm sm:text-base md:text-lg font-mono font-bold text-primary tracking-widest">{offer.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-tight mb-0.5">Value</span>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}%` :
                        offer.discountType === 'extra_gold' ? `${offer.discountValue}g` : `₹${offer.discountValue}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground font-medium leading-tight">
                    <Calendar size={14} className="text-primary shrink-0" />
                    <span className="truncate">{new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground font-medium leading-tight">
                    <Users size={14} className="text-primary shrink-0" />
                    <span>{offer.usesCount} Redemptions {offer.maxUses ? `/ ${offer.maxUses}` : '(Unlimited)'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-muted/10 border-t border-border mt-auto flex gap-2 sm:gap-3">
                <button
                  onClick={() => { setSelectedOffer(offer); setIsBroadcastModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-[10px] sm:text-xs font-medium hover:opacity-90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send size={14} /> Broadcast
                </button>
                <button
                  onClick={() => { setSelectedOffer(offer); fetchCustomers(); setIsTargetModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-[10px] sm:text-xs font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Users size={14} /> Targeted
                </button>
              </div>

              {new Date() > new Date(offer.endDate) && (
                <div className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground text-[8px] font-bold uppercase rotate-45 translate-x-4 translate-y-3 px-6 shadow-md z-10">
                  Expired
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-card border border-dashed border-border rounded-lg sm:rounded-xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Tag size={40} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold">No offers found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Create your first offer to start engaging your customers with amazing deals!</p>
            <Link href="/admin/offers/add" className="mt-6 sm:mt-8 block">
              <button className="px-6 sm:px-8 py-2 sm:py-3 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                Create Offer Now
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* BROADCAST MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setIsBroadcastModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto ring-8 ring-primary/5">
                <Send size={32} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold">Global Broadcast?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  You are about to notify <b>ALL</b> approved customers about <span className="text-primary font-bold uppercase tracking-wider">"{selectedOffer?.code}"</span>.
                  <br />This will proceed via SMS. Continue?
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 pt-4">
                <button
                  onClick={handleBroadcast}
                  disabled={submitting}
                  className="w-full py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-md font-bold text-xs sm:text-sm uppercase tracking-wider hover:opacity-90 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} /> Yes, Send it Everywhere</>}
                </button>
                <button
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  Not Right Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TARGET MODAL */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setIsTargetModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Targeted Blast</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5">Select specific members for <span className="text-primary font-bold uppercase">{selectedOffer?.code}</span></p>
              </div>
              <button onClick={() => setIsTargetModalOpen(false)} className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Search customers..."
                  className="w-full pl-11 pr-4 py-1.5 sm:py-2 bg-muted/20 border border-input rounded-md text-xs sm:text-sm font-medium outline-none focus:ring-1 focus:ring-primary transition-all"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-[300px] sm:max-h-[350px] overflow-y-auto divide-y divide-border/50 px-2 sm:px-3 py-1 custom-scrollbar">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 sm:p-4 hover:bg-primary/5 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 group"
                    onClick={() => {
                      setSelectedCustomerIds(prev =>
                        prev.includes(customer.id) ? prev.filter(id => id !== customer.id) : [...prev, customer.id]
                      );
                    }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${selectedCustomerIds.includes(customer.id) ? 'bg-primary text-white scale-105' : 'bg-muted text-muted-foreground'}`}>
                        {customer.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold group-hover:text-primary transition-colors">{customer.fullName}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{customer.mobile}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${selectedCustomerIds.includes(customer.id) ? 'bg-primary border-primary shadow-md' : 'border-input shadow-none'}`}>
                      {selectedCustomerIds.includes(customer.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 sm:py-20 text-center">
                  <Users size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium">No matches found</p>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-border flex items-center justify-between bg-muted/30">
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Selection</span>
                <span className="text-sm sm:text-base font-bold text-primary">{selectedCustomerIds.length} <span className="text-[10px] text-foreground">Customers</span></span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setSelectedCustomerIds(customers.map(c => c.id))}
                  className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground hover:text-primary transition-colors"
                >
                  All
                </button>
                <button
                  disabled={selectedCustomerIds.length === 0 || submitting}
                  onClick={handleSendToSelected}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md hover:opacity-90 shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Send</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
