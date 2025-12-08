"use client";
import { useState } from "react";
import { 
  ArrowUpCircle, 
  Wallet,
  Coins,
  Gem,
  MapPin,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Toast from "@/components/Toast";

// --- Mock Data ---
const withdrawalHistory = [
  { id: "WD-001", type: "Money Payout", amount: 50000, gold: 6.54, date: "Today, 2:30 PM", status: "Pending", address: null },
  { id: "WD-002", type: "Physical Gold", amount: null, gold: 5.0, date: "Yesterday, 10:15 AM", status: "Approved", address: "123 Main St, City" },
  { id: "WD-003", type: "Money Payout", amount: 25000, gold: 3.27, date: "01 Dec, 3:45 PM", status: "Completed", address: null },
  { id: "WD-004", type: "Jewellery Conversion", amount: null, gold: 10.0, date: "30 Nov, 11:20 AM", status: "Processing", address: "Store Pickup" },
];

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "text-secondary-foreground bg-secondary border-secondary",
    Approved: "text-primary bg-primary/10 border-primary/20",
    Processing: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    Completed: "text-green-600 bg-green-500/10 border-green-500/20",
    Rejected: "text-destructive bg-destructive/10 border-destructive/20",
  };
  const icons = {
    Pending: Clock,
    Approved: CheckCircle2,
    Processing: Clock,
    Completed: CheckCircle2,
    Rejected: XCircle,
  };
  const Icon = icons[status] || Clock;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${styles[status] || styles.Pending}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

export default function WithdrawalsPage() {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState("money");
  const [amount, setAmount] = useState("");
  const [grams, setGrams] = useState("");
  const [address, setAddress] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  const currentGoldRate = 7645;
  const availableGold = 32.5;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (withdrawalType === "money") {
      if (!amount || amount <= 0) {
        setToast({ message: "Please enter a valid amount", type: "error" });
        return;
      }
      const requiredGold = amount / currentGoldRate;
      if (requiredGold > availableGold) {
        setToast({ message: `Insufficient gold. You need ${requiredGold.toFixed(2)}g but only have ${availableGold}g`, type: "error" });
        return;
      }
    } else if (withdrawalType === "physical" || withdrawalType === "jewellery") {
      if (!grams || grams <= 0) {
        setToast({ message: "Please enter valid gold grams", type: "error" });
        return;
      }
      if (parseFloat(grams) > availableGold) {
        setToast({ message: `Insufficient gold. You only have ${availableGold}g`, type: "error" });
        return;
      }
      if (!address && !pickupLocation) {
        setToast({ message: "Please provide address or pickup location", type: "error" });
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ message: "Withdrawal request submitted! Admin will review and process.", type: "success" });
      setAmount("");
      setGrams("");
      setAddress("");
      setPickupLocation("");
    }, 1500);
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Withdrawals</h2>
          <p className="text-sm text-muted-foreground">Request money payout, physical gold, or jewellery conversion.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Withdrawal Form (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Withdrawal Type Selection */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <ArrowUpCircle size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Request Withdrawal</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Withdrawal Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Withdrawal Type</label>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setWithdrawalType("money")}
                    className={`p-4 rounded-lg border transition-all ${
                      withdrawalType === "money"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-input hover:bg-muted"
                    }`}
                  >
                    <Wallet size={24} className="mx-auto mb-2" />
                    <p className="font-medium text-sm">Money Payout</p>
                    <p className="text-xs text-muted-foreground mt-1">Convert gold to cash</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalType("physical")}
                    className={`p-4 rounded-lg border transition-all ${
                      withdrawalType === "physical"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-input hover:bg-muted"
                    }`}
                  >
                    <Coins size={24} className="mx-auto mb-2" />
                    <p className="font-medium text-sm">Physical Gold</p>
                    <p className="text-xs text-muted-foreground mt-1">Get physical gold</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalType("jewellery")}
                    className={`p-4 rounded-lg border transition-all ${
                      withdrawalType === "jewellery"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-input hover:bg-muted"
                    }`}
                  >
                    <Gem size={24} className="mx-auto mb-2" />
                    <p className="font-medium text-sm">Jewellery</p>
                    <p className="text-xs text-muted-foreground mt-1">Convert to jewellery</p>
                  </button>
                </div>
              </div>

              {/* Amount or Grams Input */}
              {withdrawalType === "money" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                    min="1"
                  />
                  {amount && (
                    <p className="text-xs text-muted-foreground">
                      Will require: {(parseFloat(amount) / currentGoldRate).toFixed(4)}g of gold
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gold (grams)</label>
                  <input
                    type="number"
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    placeholder="Enter gold grams"
                    step="0.01"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                    min="0.01"
                  />
                  {grams && (
                    <p className="text-xs text-muted-foreground">
                      Estimated value: {formatINR(parseFloat(grams) * currentGoldRate)}
                    </p>
                  )}
                </div>
              )}

              {/* Address or Pickup Location */}
              {(withdrawalType === "physical" || withdrawalType === "jewellery") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Delivery Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter complete delivery address"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[100px]"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">OR</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Pickup Location</label>
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Enter store/pickup location"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Info Card */}
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> {withdrawalType === "money" 
                    ? "Money will be transferred to your registered bank account within 24-48 hours after approval."
                    : withdrawalType === "physical"
                    ? "Physical gold will be delivered to your address or can be picked up from our store."
                    : "Jewellery conversion will be processed and delivered to your address or available for pickup."
                  }
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle size={16} /> Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Withdrawal History (Span 1) */}
        <div className="space-y-6">
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Withdrawal History</h3>
            
            <div className="space-y-4">
              {withdrawalHistory.map((withdrawal) => (
                <div key={withdrawal.id} className="p-4 bg-muted/30 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{withdrawal.id}</span>
                    <StatusBadge status={withdrawal.status} />
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-foreground">{withdrawal.type}</p>
                    {withdrawal.amount ? (
                      <p className="text-lg font-bold text-foreground">{formatINR(withdrawal.amount)}</p>
                    ) : (
                      <p className="text-lg font-bold text-foreground">{withdrawal.gold} g</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{withdrawal.date}</span>
                    {withdrawal.gold && withdrawal.amount && (
                      <span>{withdrawal.gold} g</span>
                    )}
                  </div>
                  {withdrawal.address && (
                    <div className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                      <MapPin size={12} className="mt-0.5 shrink-0" />
                      <span>{withdrawal.address}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2 text-sm border border-border rounded-md text-muted-foreground hover:bg-muted transition-colors">
              View All Withdrawals
            </button>
          </div>

          {/* Available Gold Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-2">Available Gold</p>
            <p className="text-2xl font-bold text-primary">{availableGold} g</p>
            <p className="text-xs text-muted-foreground mt-1">Current Rate: ₹{currentGoldRate.toLocaleString()}/g</p>
          </div>

        </div>

      </div>

    </div>
  );
}

