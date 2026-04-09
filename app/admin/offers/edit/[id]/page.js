"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Edit,
  Loader2,
  Percent,
  Coins,
  Calendar,
  Info,
  X,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import Toast from "@/components/Toast";
import PremiumDatePicker from "@/components/datePicker";
import OfferService from "@/services/admin/offers.service";
import Link from "next/link";


export default function EditOffer({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
    maxUses: "",
    usesPerCustomer: 1,
    status: "active",
    applicableTo: "deposit"
  });

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await OfferService.getOfferById(id);
        const offer = response.data;
        
        // Format dates for the date picker (YYYY-MM-DD)
        const formatForInput = (dateStr) => {
          if (!dateStr) return "";
          const d = new Date(dateStr);
          return d.toISOString().split('T')[0];
        };

        setFormData({
          ...offer,
          startDate: formatForInput(offer.startDate),
          endDate: formatForInput(offer.endDate),
          maxUses: offer.maxUses || "",
          discountValue: offer.discountValue.toString()
        });
      } catch (error) {
        setToast({ message: "Failed to fetch offer details", type: "error" });
        setTimeout(() => router.push("/admin/offers"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      setToast({ message: "Please select both start and end dates", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await OfferService.updateOffer(id, {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        usesPerCustomer: parseInt(formData.usesPerCustomer)
      });
      setToast({ message: "Offer updated successfully!", type: "success" });
      setTimeout(() => {
        router.push("/admin/offers");
      }, 1500);
    } catch (error) {
      setToast({ message: error.response?.data?.message || "Failed to update offer", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground font-medium">Loading offer details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-2 sm:gap-4">
        <Link 
          href="/admin/offers" 
          className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground mr-1"
        >
          <ChevronLeftIcon size={20} />
        </Link>
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Edit className="text-primary w-5 h-5 sm:w-6 sm:h-6" /> Edit Offer
          </h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Modify the details of your promotional coupon.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                   <Info size={16} className="shrink-0" /> Basic Information
                </h3>
                <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
                  {['deposit', 'withdrawal', 'both'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, applicableTo: type})}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                        formData.applicableTo === type 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-tight block">Offer Title</label>
                   <input 
                    required
                    placeholder="e.g. Summer Gold Harvest"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-background border border-input rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-tight block">Coupon Code</label>
                   <input 
                    required
                    placeholder="e.g. GOLD2024"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-background border border-input rounded-md text-xs sm:text-sm font-mono font-bold tracking-widest uppercase outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                   />
                </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-tight block">Description</label>
                 <textarea 
                  rows={3}
                  placeholder="Tell your customers about this amazing offer..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-background border border-input rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                 />
              </div>

              <div className="pt-4 sm:pt-6 border-t border-border/50">
                 <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-4 sm:mb-6">
                   <Percent size={16} className="shrink-0" /> Discount Details
                 </h3>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                       <label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-tight block mb-1">Discount Type</label>
                       <div className="grid grid-cols-3 gap-2">
                         {[
                            { id: 'percentage', label: '%', icon: Percent },
                            { id: 'amount', label: '₹', icon: Tag },
                            { id: 'extra_gold', label: 'g', icon: Coins },
                         ].map(type => (
                           <button
                             key={type.id}
                             type="button"
                             onClick={() => setFormData({...formData, discountType: type.id})}
                             className={`flex items-center justify-center gap-1.5 p-2 rounded-md border transition-all ${
                               formData.discountType === type.id 
                               ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]' 
                               : 'bg-background border-input text-muted-foreground hover:bg-muted'
                             }`}
                           >
                             <type.icon size={14} />
                             <span className="text-[10px] font-bold uppercase">{formData.discountType === type.id ? type.id.replace('_', ' ') : type.label}</span>
                           </button>
                         ))}
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-tight block">Value</label>
                       <div className="relative">
                          <input 
                            required
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-4 pr-10 py-2 sm:py-2.5 bg-background border border-input rounded-md text-xs sm:text-sm font-bold outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                            value={formData.discountValue}
                            onChange={e => setFormData({...formData, discountValue: e.target.value})}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-[10px] uppercase">
                             {formData.discountType === 'percentage' ? '%' : formData.discountType === 'extra_gold' ? 'g' : '₹'}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-border/50">
                 <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-4 sm:mb-6">
                   <Calendar size={16} className="shrink-0" /> Duration & Limits
                 </h3>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <PremiumDatePicker 
                      label="Start Date"
                      value={formData.startDate}
                      onChange={(val) => setFormData(prev => ({...prev, startDate: val}))}
                    />
                    <PremiumDatePicker 
                      label="End Date"
                      value={formData.endDate}
                      onChange={(val) => setFormData(prev => ({...prev, endDate: val}))}
                    />
                    <div className="space-y-1.5">
                       <label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-tight block">Max Global Uses</label>
                       <input 
                        type="number"
                        placeholder="Unlimited"
                        className="w-full px-4 py-2 sm:py-2.5 bg-background border border-input rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                        value={formData.maxUses}
                        onChange={e => setFormData({...formData, maxUses: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-tight block">Uses Per Customer</label>
                       <input 
                        required
                        type="number"
                        min="1"
                        className="w-full px-4 py-2 sm:py-2.5 bg-background border border-input rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
                        value={formData.usesPerCustomer}
                        onChange={e => setFormData({...formData, usesPerCustomer: e.target.value})}
                       />
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-muted/10 border-t border-border flex justify-end gap-3">
               <button 
                type="button" 
                onClick={() => router.back()}
                className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
               >
                 Cancel
               </button>
               <button 
                type="submit"
                disabled={submitting}
                className="px-6 sm:px-8 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
               >
                 {submitting ? <Loader2 size={16} className="animate-spin" /> : <><Edit size={16} /> Update Offer</>}
               </button>
            </div>
          </form>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-4">
           <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-muted-foreground ml-1">Live Preview</h3>
           
           <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-300">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {formData.discountType === 'percentage' ? <Percent size={18} /> : formData.discountType === 'extra_gold' ? <Coins size={18} /> : <Tag size={18} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      formData.applicableTo === 'deposit' ? 'border-blue-200 bg-blue-50 text-blue-600' :
                      formData.applicableTo === 'withdrawal' ? 'border-amber-200 bg-amber-50 text-amber-600' :
                      'border-purple-200 bg-purple-50 text-purple-600'
                    }`}>
                      {formData.applicableTo}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase border border-primary/20 bg-primary/5 text-primary">
                      {formData.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-1 truncate">{formData.title || "Offer Title"}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 h-8 leading-tight">{formData.description || "Enter a description to see how it looks here..."}</p>

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/40 rounded-lg sm:rounded-xl border border-dashed border-primary/30 relative overflow-hidden group">
                   <div className="relative z-10 flex flex-col items-center">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground tracking-tight mb-0.5">Coupon Code</span>
                      <span className="text-xl sm:text-2xl font-mono font-bold text-primary tracking-widest">{formData.code || "XXXXXX"}</span>
                   </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                   <div className="space-y-0.5">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground leading-none">Value</span>
                      <p className="text-sm sm:text-base font-bold text-foreground">
                        {formData.discountType === 'percentage' ? `${formData.discountValue || '0'}%` : 
                         formData.discountType === 'extra_gold' ? `${formData.discountValue || '0'}g` : `₹${formData.discountValue || '0'}`}
                      </p>
                   </div>
                   <div className="space-y-0.5 text-right">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground leading-none">Valid Till</span>
                      <p className="text-sm sm:text-base font-bold text-foreground">{formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'N/A'}</p>
                   </div>
                </div>
              </div>
              <div className="bg-primary/5 p-2 sm:p-3 text-center">
                 <p className="text-[9px] sm:text-[10px] font-bold text-primary uppercase">Special Limited Time Promotion</p>
              </div>
           </div>

           <div className="bg-blue-500/5 border border-blue-500/10 p-3 sm:p-4 rounded-lg sm:rounded-xl space-y-1.5 sm:space-y-2">
              <h4 className="text-[10px] sm:text-xs font-bold text-blue-500 flex items-center gap-1.5"><Info size={14} /> Tip</h4>
              <p className="text-[9px] sm:text-[10px] text-blue-500/80 leading-relaxed font-medium">
                Short and catchy coupon codes like <b className="text-blue-600">GOLD20</b> perform better than long complex strings.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
