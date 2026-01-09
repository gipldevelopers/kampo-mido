"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpCircle,
  Wallet,
  Coins,
  Gem,
  MapPin,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import withdrawalsService from "../../../services/customer/withdrawal.service";
import Toast from "@/components/Toast";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "text-secondary-foreground bg-secondary border-secondary",
    approved: "text-primary bg-primary/10 border-primary/20",
    processing: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    completed: "text-green-600 bg-green-500/10 border-green-500/20",
    rejected: "text-destructive bg-destructive/10 border-destructive/20",
  };
  const icons = {
    pending: Clock,
    approved: CheckCircle2,
    processing: Clock,
    completed: CheckCircle2,
    rejected: XCircle,
  };
  const Icon = icons[status] || Clock;

  // Capitalize first letter for display
  const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border flex items-center gap-0.5 sm:gap-1 w-fit ${styles[status] || styles.pending}`}>
      <Icon size={10} className="sm:w-3 sm:h-3" />
      {statusDisplay}
    </span>
  );
};

export default function WithdrawalsPage() {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState("money");
  const [amount, setAmount] = useState("");
  const [grams, setGrams] = useState("");
  const [address, setAddress] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  // API data states
  const [availableGold, setAvailableGold] = useState(0);
  const [currentGoldRate, setCurrentGoldRate] = useState(0);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Derived state: how much gold is required for the current request
  const requiredGramsForMoney =
    withdrawalType === "money" && amount && currentGoldRate > 0
      ? parseFloat(amount) / currentGoldRate
      : 0;

  const isExceedingForMoney =
    withdrawalType === "money" &&
    requiredGramsForMoney > 0 &&
    requiredGramsForMoney > availableGold;

  const isExceedingForGold =
    (withdrawalType === "physical" || withdrawalType === "jewellery") &&
    grams &&
    parseFloat(grams) > availableGold;

  const isInsufficientGold = isExceedingForMoney || isExceedingForGold;

  const formatINR = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoadingData(true);

      // Fetch available gold and current rate
      const goldResponse = await withdrawalsService.checkAvailableGold();
      if (goldResponse.success && goldResponse.data) {
        setAvailableGold(goldResponse.data.availableGold);
        setCurrentGoldRate(goldResponse.data.currentGoldRate);
      }

      // Fetch withdrawal history
      const historyResponse = await withdrawalsService.getWithdrawalHistory();
      if (historyResponse.success && historyResponse.data) {
        setWithdrawalHistory(historyResponse.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setToast({
        message: "Failed to load withdrawal data. Please try again.",
        type: "error"
      });
    } finally {
      setLoadingData(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchInitialData();
      setToast({
        message: "Data refreshed successfully",
        type: "success"
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handle withdrawal submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate input
      if (withdrawalType === "money") {
        if (!amount || amount <= 0) {
          setToast({ message: "Please enter a valid amount", type: "error" });
          return;
        }

        // Validate with API
        const validation = await withdrawalsService.calculateWithdrawal(
          withdrawalType === "money" ? "money" : withdrawalType,
          amount,
          null
        );

        if (!validation.data.isSufficient) {
          setToast({ message: validation.data.message, type: "error" });
          return;
        }
      } else if (withdrawalType === "physical" || withdrawalType === "jewellery") {
        if (!grams || grams <= 0) {
          setToast({ message: "Please enter valid gold grams", type: "error" });
          return;
        }

        // Validate with API
        const validation = await withdrawalsService.calculateWithdrawal(
          withdrawalType === "physical" ? "gold" : "jewellery",
          null,
          grams
        );

        if (!validation.data.isSufficient) {
          setToast({ message: validation.data.message, type: "error" });
          return;
        }

        if (!address && !pickupLocation) {
          setToast({ message: "Please provide address or pickup location", type: "error" });
          return;
        }
      }

      setLoading(true);

      // Map frontend types to backend types
      const backendType = withdrawalType === "money" ? "money" :
        withdrawalType === "physical" ? "gold" : "jewellery";

      // Prepare withdrawal data
      const withdrawalData = {
        type: backendType,
        amount: withdrawalType === "money" ? parseFloat(amount) : null,
        grams: (withdrawalType === "physical" || withdrawalType === "jewellery") ? parseFloat(grams) : null,
        address: address || null,
        pickupLocation: pickupLocation || null
      };

      // Submit withdrawal request
      const response = await withdrawalsService.createWithdrawal(withdrawalData);

      if (response.success) {
        setToast({
          message: response.message || "Withdrawal request submitted! Admin will review and process.",
          type: "success"
        });

        // Reset form
        setAmount("");
        setGrams("");
        setAddress("");
        setPickupLocation("");

        // Refresh data
        await fetchInitialData();
      } else {
        setToast({
          message: response.message || "Failed to submit withdrawal request",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      setToast({
        message: error.response?.data?.message || "Failed to submit withdrawal request",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle calculate button
  const handleCalculate = async () => {
    try {
      if (withdrawalType === "money") {
        if (!amount || amount <= 0) {
          setToast({ message: "Please enter a valid amount", type: "error" });
          return;
        }

        const response = await withdrawalsService.calculateWithdrawal(
          "money",
          parseFloat(amount),
          null
        );

        if (response.success) {
          setToast({
            message: response.data.message,
            type: response.data.isSufficient ? "success" : "warning"
          });
        }
      } else {
        if (!grams || grams <= 0) {
          setToast({ message: "Please enter valid gold grams", type: "error" });
          return;
        }

        const response = await withdrawalsService.calculateWithdrawal(
          withdrawalType === "physical" ? "gold" : "jewellery",
          null,
          parseFloat(grams)
        );

        if (response.success) {
          setToast({
            message: response.data.message,
            type: response.data.isSufficient ? "success" : "warning"
          });
        }
      }
    } catch (error) {
      console.error("Error calculating withdrawal:", error);
    }
  };

  // Format date from API
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString; // API already formats dates
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading withdrawal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Withdrawals</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 hover:bg-muted rounded-md transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            Request money payout, physical gold, or jewellery conversion.
          </p>
        </div>
        {refreshing && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Refreshing...
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">

        {/* LEFT COLUMN: Withdrawal Form (Span 2) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">

          {/* Withdrawal Type Selection */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
              <ArrowUpCircle size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Request Withdrawal</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Withdrawal Type */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Withdrawal Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={() => setWithdrawalType("money")}
                    className={`p-3 sm:p-4 rounded-lg border transition-all ${withdrawalType === "money"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-input hover:bg-muted"
                      }`}
                  >
                    <Wallet size={20} className="sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2" />
                    <p className="font-medium text-[11px] sm:text-xs md:text-sm">Money Payout</p>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Convert gold to cash</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalType("physical")}
                    className={`p-3 sm:p-4 rounded-lg border transition-all ${withdrawalType === "physical"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-input hover:bg-muted"
                      }`}
                  >
                    <Coins size={20} className="sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2" />
                    <p className="font-medium text-[11px] sm:text-xs md:text-sm">Physical Gold</p>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Get physical gold</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalType("jewellery")}
                    className={`p-3 sm:p-4 rounded-lg border transition-all ${withdrawalType === "jewellery"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-input hover:bg-muted"
                      }`}
                  >
                    <Gem size={20} className="sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2" />
                    <p className="font-medium text-[11px] sm:text-xs md:text-sm">Jewellery</p>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Convert to jewellery</p>
                  </button>
                </div>
              </div>

              {/* Amount or Grams Input */}
              {withdrawalType === "money" ? (
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Amount (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount to withdraw"
                      className="flex-1 px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      required
                      min="1"
                    />
                    <button
                      type="button"
                      onClick={handleCalculate}
                      className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-[11px] sm:text-xs hover:bg-secondary/80 transition-colors"
                    >
                      Calculate
                    </button>
                  </div>
                  {amount && currentGoldRate > 0 && (
                    <p
                      className={`text-[9px] sm:text-[10px] md:text-xs ${
                        isExceedingForMoney ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      Will require: {requiredGramsForMoney.toFixed(4)}g of gold{" "}
                      {isExceedingForMoney &&
                        `(available: ${availableGold.toFixed(4)}g, reduce amount)`}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Gold (grams)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      placeholder="Enter gold grams"
                      step="0.01"
                      className="flex-1 px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      required
                      min="0.01"
                    />
                    <button
                      type="button"
                      onClick={handleCalculate}
                      className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-[11px] sm:text-xs hover:bg-secondary/80 transition-colors"
                    >
                      Calculate
                    </button>
                  </div>
                  {grams && currentGoldRate > 0 && (
                    <p
                      className={`text-[9px] sm:text-[10px] md:text-xs ${
                        isExceedingForGold ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      Estimated value: {formatINR(parseFloat(grams) * currentGoldRate)}{" "}
                      {isExceedingForGold &&
                        `(available: ${availableGold.toFixed(4)}g, reduce grams)`}
                    </p>
                  )}
                </div>
              )}

              {/* Address or Pickup Location */}
              {(withdrawalType === "physical" || withdrawalType === "jewellery") && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Delivery Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter complete delivery address"
                      className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">OR</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Pickup Location</label>
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Enter store/pickup location"
                      className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Info Card */}
              <div className="bg-muted/30 p-3 sm:p-4 rounded-lg border border-border">
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> {withdrawalType === "money"
                    ? "Money will be transferred to your registered bank account within 24-48 hours after approval."
                    : withdrawalType === "physical"
                      ? "Physical gold will be delivered to your address or can be picked up from our store."
                      : "Jewellery conversion will be processed and delivered to your address or available for pickup."
                  }
                </p>
              </div>

              <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row justify-end gap-2">
                <button
                  type="submit"
                  disabled={loading || isInsufficientGold}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-[11px] sm:text-xs md:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle size={14} className="sm:w-4 sm:h-4" /> <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Withdrawal History (Span 1) */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">

          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg">Withdrawal History</h3>
              {withdrawalHistory.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {withdrawalHistory.length} records
                </span>
              )}
            </div>

            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {withdrawalHistory.length > 0 ? (
                withdrawalHistory.map((withdrawal) => (
                  <div key={withdrawal.id} className="p-2.5 sm:p-3 md:p-4 bg-muted/30 border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-muted-foreground truncate flex-1 pr-2">{withdrawal.id}</span>
                      <StatusBadge status={withdrawal.status} />
                    </div>
                    <div className="mb-1.5 sm:mb-2">
                      <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">{withdrawal.typeDisplay}</p>
                      {withdrawal.amountDisplay ? (
                        <p className="text-base sm:text-lg font-bold text-foreground wrap-break-word">{withdrawal.amountDisplay}</p>
                      ) : (
                        <p className="text-base sm:text-lg font-bold text-foreground">{withdrawal.gramsDisplay}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                      <span className="truncate flex-1 pr-2">{withdrawal.date}</span>
                      {withdrawal.gramsDisplay && withdrawal.amountDisplay && (
                        <span className="shrink-0 ml-2">{withdrawal.gramsDisplay}</span>
                      )}
                    </div>
                    {withdrawal.address && (
                      <div className="mt-1.5 sm:mt-2 flex items-start gap-1 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                        <MapPin size={10} className="sm:w-3 sm:h-3 mt-0.5 shrink-0" />
                        <span className="wrap-break-word">{withdrawal.address}</span>
                      </div>
                    )}
                    {withdrawal.pickupLocation && (
                      <div className="mt-1 sm:mt-1.5 flex items-start gap-1 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                        <MapPin size={10} className="sm:w-3 sm:h-3 mt-0.5 shrink-0" />
                        <span className="wrap-break-word">Pickup: {withdrawal.pickupLocation}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No withdrawal history yet</p>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/customers/withdrawals/history')}
              className="w-full mt-3 sm:mt-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm border border-border rounded-md text-muted-foreground hover:bg-muted transition-colors"
            >
              View All Withdrawals
            </button>
          </div>

          {/* Available Gold Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Available Gold</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">{availableGold.toFixed(4)} g</p>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-1">
              Current Rate: ₹{currentGoldRate.toLocaleString('en-IN')}/g
            </p>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5">
              Value: {formatINR(availableGold * currentGoldRate)}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-2 sm:mb-3">Quick Actions</p>
            <div className="space-y-2">
              <button
                onClick={() => setWithdrawalType("money")}
                className="w-full text-left px-3 py-2 text-[10px] sm:text-xs border border-input rounded-md hover:bg-muted transition-colors"
              >
                Request Money Payout
              </button>
              <button
                onClick={() => setWithdrawalType("physical")}
                className="w-full text-left px-3 py-2 text-[10px] sm:text-xs border border-input rounded-md hover:bg-muted transition-colors"
              >
                Request Physical Gold
              </button>
              <button
                onClick={() => setWithdrawalType("jewellery")}
                className="w-full text-left px-3 py-2 text-[10px] sm:text-xs border border-input rounded-md hover:bg-muted transition-colors"
              >
                Request Jewellery
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}