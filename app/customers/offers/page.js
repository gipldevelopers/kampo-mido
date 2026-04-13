"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Gift,
  Search,
  Calendar,
  Percent,
  Coins,
  ClipboardCheck,
  Clipboard,
  Loader2,
  Check,
  ArrowRight
} from "lucide-react";
import Toast from "@/components/Toast";
import OfferService from "@/services/customer/offers.service";

// --- Components ---

const CategoryBadge = ({ type }) => {
  const styles = {
    deposit: "bg-blue-100 text-blue-700 border-blue-200",
    withdrawal: "bg-amber-100 text-amber-700 border-amber-200",
    both: "bg-purple-100 text-purple-700 border-purple-200"
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[type] || "bg-muted text-muted-foreground"}`}>
      {type}
    </span>
  );
};

const DiscountIcon = ({ type }) => {
  switch (type) {
    case 'percentage': return <div className="p-2 rounded-full bg-blue-100 text-blue-600"><Percent size={18} /></div>;
    case 'amount': return <div className="p-2 rounded-full bg-emerald-100 text-emerald-600"><Tag size={18} /></div>;
    case 'extra_gold': return <div className="p-2 rounded-full bg-amber-100 text-amber-600"><Coins size={18} /></div>;
    default: return <div className="p-2 rounded-full bg-gray-100 text-gray-600"><Gift size={18} /></div>;
  }
};

export default function CustomerOffers() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await OfferService.getAvailableOffers();
      setOffers(response.data || []);
    } catch (error) {
      setToast({ message: "Failed to load offers", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = (offer) => {
    navigator.clipboard.writeText(offer.code);
    setCopiedCode(offer.code);
    
    setToast({ 
      message: `Code ${offer.code} copied! Redirecting...`, 
      type: "success" 
    });

    setTimeout(() => setCopiedCode(null), 2000);

    setTimeout(() => {
      if (offer.applicableTo === 'withdrawal') {
        router.push("/customers/withdrawals");
      } else {
        router.push("/customers/deposit-page");
      }
    }, 1500);
  };

  const filteredOffers = offers.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Offers & Rewards</h1>
          <p className="text-sm text-muted-foreground mt-1">Unlock exclusive benefits for your transactions.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search offers..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading offers...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-xl border border-dashed border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No offers found</h3>
            <p className="text-muted-foreground text-center max-w-sm mt-2">
                New promotional offers will appear here when they become available.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {filteredOffers.map((offer) => (
            <div 
              key={offer.id} 
              className="group flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 bg-card border border-border rounded-xl transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="shrink-0 flex sm:flex-col items-center gap-2">
                {DiscountIcon({ type: offer.discountType })}
                <div className="hidden sm:block">
                   <CategoryBadge type={offer.applicableTo} />
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="sm:hidden mb-1 leading-none">
                       <CategoryBadge type={offer.applicableTo} />
                    </div>
                    <h4 className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                      {offer.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 shrink-0">
                    <Calendar size={12} className="text-primary" />
                    Valid till {new Date(offer.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {offer.description || "Apply this code during your next transaction to claim your reward."}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-dashed border-primary/30 rounded-lg">
                    <span className="text-sm font-mono font-black text-primary tracking-widest leading-none">
                      {offer.code}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleClaim(offer)}
                    disabled={offer.isFullyUsed}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] ${
                      offer.isFullyUsed 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    {offer.isFullyUsed ? (
                      <><ClipboardCheck size={14} /> Used</>
                    ) : copiedCode === offer.code ? (
                      <><Check size={14} /> Copied</>
                    ) : (
                      <><Clipboard size={14} /> Claim</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
