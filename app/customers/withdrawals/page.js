"use client";
import { useState, useEffect, useRef } from "react";
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
  AlertCircle,
  Lock,
  AlertTriangle,
  X,
  FileText
} from "lucide-react";
import withdrawalsService from "../../../services/customer/withdrawal.service";
import KYCService from "@/services/customer/kyc.service";
import API from "@/lib/api";
import Link from "next/link";
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
  const [validating, setValidating] = useState(false);
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
  const [isCapLocked, setIsCapLocked] = useState(false);
  const [unlockDate, setUnlockDate] = useState(null);
  const [emergencyRequests, setEmergencyRequests] = useState([]);

  // Emergency Modal State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyAmount, setEmergencyAmount] = useState("");
  const [emergencyReason, setEmergencyReason] = useState("");
  const [submittingEmergency, setSubmittingEmergency] = useState(false);
  const [emergencyProof, setEmergencyProof] = useState(null);
  const [emergencyProofPreview, setEmergencyProofPreview] = useState(null);
  const fileInputRef = useRef(null);

  // KYC State
  const [kycVerified, setKycVerified] = useState(false);
  const [checkingKYC, setCheckingKYC] = useState(true);

  // Check KYC Status
  useEffect(() => {
    const checkKYC = async () => {
      try {
        const response = await KYCService.getKYCStatus();
        const status = response.data?.status || response.data?.kycStatus || "pending";
        if (status.toLowerCase() === 'approved' || status.toLowerCase() === 'verified') {
          setKycVerified(true);
        } else {
          setKycVerified(false);
        }
      } catch (error) {
        console.error("KYC Check Error", error);
        setKycVerified(false);
      } finally {
        setCheckingKYC(false);
      }
    };
    checkKYC();
  }, []);

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
  const fetchInitialData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoadingData(true);
      }

      const goldResponse = await withdrawalsService.checkAvailableGold();
      if (goldResponse.success && goldResponse.data) {
        setAvailableGold(goldResponse.data.availableGold);
        setCurrentGoldRate(goldResponse.data.currentGoldRate);
        setIsCapLocked(goldResponse.data.isCapLocked || false);
        setUnlockDate(goldResponse.data.unlockDate || null);
      }

      // Fetch withdrawal history
      const historyResponse = await withdrawalsService.getWithdrawalHistory();
      if (historyResponse.success && historyResponse.data) {
        setWithdrawalHistory(historyResponse.data.data || []);
      }

      // Fetch emergency requests
      const emergencyResponse = await API.get("/customer/cap-system/emergency-requests");
      if (emergencyResponse.data.success) {
        setEmergencyRequests(emergencyResponse.data.data || []);
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
      await fetchInitialData(true);
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
    if (loading || validating) return;

    try {
      setValidating(true);

      // Validate input
      if (withdrawalType === "money") {
        if (!amount || amount <= 0) {
          setToast({ message: "Please enter a valid amount", type: "error" });
          setValidating(false);
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
          setValidating(false);
          return;
        }
      } else if (withdrawalType === "physical" || withdrawalType === "jewellery") {
        if (!grams || grams <= 0) {
          setToast({ message: "Please enter valid gold grams", type: "error" });
          setValidating(false);
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
          setValidating(false);
          return;
        }

        if (!address && !pickupLocation) {
          setToast({ message: "Please provide address or pickup location", type: "error" });
          setValidating(false);
          return;
        }
      }

      setValidating(false);
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
      setValidating(false);
    }
  };

  const handleEmergencyWithdrawal = async (e) => {
    e.preventDefault();
    if (!emergencyAmount || parseFloat(emergencyAmount) <= 0) {
      setToast({ message: "Please enter a valid amount", type: "error" });
      return;
    }

    if (!emergencyReason || emergencyReason.length < 10) {
      setToast({ message: "Please provide a detailed reason (at least 10 characters)", type: "error" });
      return;
    }

    setSubmittingEmergency(true);
    try {
      const formData = new FormData();
      formData.append("amount", parseFloat(emergencyAmount));
      formData.append("reason", emergencyReason);
      if (emergencyProof) {
        formData.append("proof", emergencyProof);
      }

      const response = await API.post("/customer/cap-system/submit-emergency-request", formData);

      if (response.data.success) {
        setToast({
          message: "Emergency withdrawal request submitted! Admin will contact you shortly.",
          type: "success"
        });
        setShowEmergencyModal(false);
        setEmergencyAmount("");
        setEmergencyReason("");
        setEmergencyProof(null);
        setEmergencyProofPreview(null);
        await fetchInitialData();
      } else {
        setToast({ message: response.data.message || "Failed to submit request", type: "error" });
      }
    } catch (error) {
      console.error("Emergency Withdrawal Error:", error);
      setToast({
        message: error.response?.data?.message || "Failed to submit request",
        type: "error"
      });
    } finally {
      setSubmittingEmergency(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';

      if (!isImage && !isPDF) {
        setToast({ message: "Please upload an image or PDF file", type: "error" });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setToast({ message: "File size exceeds 10MB", type: "error" });
        return;
      }

      setEmergencyProof(file);
      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => setEmergencyProofPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setEmergencyProofPreview(null);
      }
    }
  };

  const openEmergencyModal = async () => {
    setShowEmergencyModal(true);
    try {
      const summaryRes = await API.get("/customer/dashboard/summary");
      if (summaryRes.data.success && summaryRes.data.data) {
        setAvailableGold(summaryRes.data.data.totalGoldGrams || 0);
        setCurrentGoldRate(summaryRes.data.data.currentGoldRate || 0);
      }
    } catch (e) {
      console.error("Error fetching dashboard summary for emergency modal", e);
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

      {/* Withdrawals Page Content Blocks */}
      {checkingKYC ? (
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : isCapLocked ? (
        <div className="bg-card border border-primary/20 bg-primary/5 rounded-lg sm:rounded-xl p-6 md:p-10 text-center space-y-4 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Withdrawals Temporarily Disabled</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your account is currently under a Global Cap Lock lock-in period. All gold withdrawals and conversions are suspended until your term is completed.
          </p>
          {unlockDate && (
            <div className="mt-4 inline-block px-4 py-2 bg-background border border-primary/20 rounded-md">
              <span className="text-sm font-medium text-primary">Unlocks on: {new Date(unlockDate).toLocaleDateString()}</span>
            </div>
          )}

          <div className="pt-6 border-t border-primary/10 w-full max-w-md mt-6">
            <p className="text-xs text-muted-foreground mb-3 italic">Have an urgent requirement?</p>
            <button
              onClick={openEmergencyModal}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-bold hover:opacity-90 transition-all shadow-md active:scale-[0.98]"
            >
              <AlertTriangle size={16} /> Request Emergency Withdrawal
            </button>
          </div>
        </div>
      ) : !kycVerified ? (
        <div className="bg-card border border-destructive/20 rounded-lg sm:rounded-xl p-6 md:p-10 text-center space-y-4 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground">KYC Verification Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            To ensure security and compliance, you must complete your KYC verification before making any withdrawals.
          </p>
          <div className="pt-2 flex flex-col gap-3 w-full max-w-xs mx-auto">
            <Link href="/customers/kyc-page" className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity shadow-md">
              Complete Verification
            </Link>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-card px-2 text-muted-foreground">OR</span></div>
            </div>

            <button
              onClick={openEmergencyModal}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-bold hover:opacity-90 transition-all shadow-md"
            >
              Emergency Withdrawal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* LEFT COLUMN: Withdrawal Form (Span 2) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm relative overflow-hidden">

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
                      disabled={loading || validating}
                      onClick={() => setWithdrawalType("money")}
                      className={`p-3 sm:p-4 rounded-lg border transition-all ${withdrawalType === "money"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-input hover:bg-muted"
                        }`}
                    >
                      <Wallet size={20} className="sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2" />
                      <p className="font-medium text-[11px] sm:text-xs md:text-sm">Money Payout</p>
                      <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Convert gold to sell</p>
                    </button>
                    <button
                      type="button"
                      disabled={loading || validating}
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
                      disabled={loading || validating}
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
                        className="flex-1 px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
                        required
                        disabled={loading || validating}
                        min="1"
                      />
                      <button
                        type="button"
                        disabled={loading || validating}
                        onClick={handleCalculate}
                        className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-[11px] sm:text-xs hover:bg-secondary/80 transition-colors disabled:opacity-50"
                      >
                        Calculate
                      </button>
                    </div>
                    {amount && currentGoldRate > 0 && !isCapLocked && (
                      <p
                        className={`text-[9px] sm:text-[10px] md:text-xs ${isExceedingForMoney ? "text-destructive" : "text-muted-foreground"
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
                        disabled={loading || validating}
                        step="0.01"
                        className="flex-1 px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
                        required
                        min="0.01"
                      />
                      <button
                        type="button"
                        disabled={loading || validating}
                        onClick={handleCalculate}
                        className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-[11px] sm:text-xs hover:bg-secondary/80 transition-colors disabled:opacity-50"
                      >
                        Calculate
                      </button>
                    </div>
                    {grams && currentGoldRate > 0 && !isCapLocked && (
                      <p
                        className={`text-[9px] sm:text-[10px] md:text-xs ${isExceedingForGold ? "text-destructive" : "text-muted-foreground"
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
                        disabled={loading || validating}
                        placeholder="Enter complete delivery address"
                        className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y disabled:opacity-50"
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
                        disabled={loading || validating}
                        placeholder="Enter store/pickup location"
                        className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
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
                    disabled={loading || validating || isInsufficientGold}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-[11px] sm:text-xs md:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading || validating ? (
                      <>
                        <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> <span>{validating ? "Validating..." : "Submitting..."}</span>
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
            {(!isCapLocked && kycVerified) && (
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
                  <div className="pt-2 border-t border-border mt-2">
                    <button
                      onClick={openEmergencyModal}
                      className="w-full text-left px-3 py-2 text-[10px] sm:text-xs bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-all flex items-center gap-1.5 font-medium"
                    >
                      <AlertTriangle size={12} /> Emergency Withdrawal
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Emergency Bypass Requests Section (Table UI) */}
      {emergencyRequests.length > 0 && (
        <div className="mt-8 space-y-4 max-w-8xl mx-auto pb-10">
          <div className="flex items-center gap-2 border-b border-border pb-2 px-1">
            <AlertTriangle className="text-destructive" size={18} />
            <h3 className="text-lg font-bold text-foreground">Emergency Request History</h3>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Date</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Requested Amount</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Penalty (1.75%)</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Final Payout</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Reason</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Admin Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {emergencyRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 text-[11px] font-bold text-destructive">#{req.id}</td>
                    <td className="px-4 py-4 text-[11px] text-muted-foreground">
                      {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-foreground">
                      ₹ {parseFloat(req.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-destructive">
                      ₹ {parseFloat(req.penaltyAmount || (parseFloat(req.amount) * 0.0175)).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-xs font-extrabold text-primary">
                      ₹ {(parseFloat(req.amount) * 0.9825).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 min-w-[200px]">
                      <p className="text-[11px] text-foreground line-clamp-2 leading-relaxed italic">
                        "{req.reason}"
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-4">
                      {req.adminNotes ? (
                        <div className="bg-amber-50 border border-amber-100 p-2 rounded text-[10px] text-amber-800 italic leading-snug max-w-[200px]">
                          {req.adminNotes}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">No response yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-foreground px-1 italic">
            * Emergency requests carry a mandatory 1.75% bypass fee which is deducted from the approved amount.
          </p>
        </div>
      )}

      {/* Emergency Withdrawal Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowEmergencyModal(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-border bg-destructive/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" size={20} />
                <h3 className="text-base sm:text-lg font-bold text-foreground">Emergency Withdrawal</h3>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleEmergencyWithdrawal} className="flex flex-col max-h-[85vh] sm:max-h-none">
              {/* Scrollable Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto sm:overflow-visible">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-muted/30 p-2 sm:p-2.5 rounded-lg border border-border">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground block mb-0.5">Available Gold</span>
                    <span className="text-xs sm:text-sm font-bold text-primary">{availableGold.toFixed(4)} g</span>
                  </div>
                  <div className="bg-muted/30 p-2 sm:p-2.5 rounded-lg border border-border">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground block mb-0.5">Approx. Value</span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">₹{(availableGold * currentGoldRate).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    value={emergencyAmount}
                    onChange={(e) => setEmergencyAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-destructive/20 focus:border-destructive outline-none transition-all"
                    required
                  />

                  {emergencyAmount && (
                    <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-destructive/5 border border-destructive/10 rounded-lg space-y-1.5 sm:space-y-2">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs">
                        <span className="text-muted-foreground">Requested Amount:</span>
                        <span className="font-semibold text-foreground">₹{parseFloat(emergencyAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] sm:text-xs">
                        <span className="text-destructive font-medium flex items-center gap-1">
                          <AlertCircle size={10} className="sm:w-3 sm:h-3" /> Penalty (1.75%):
                        </span>
                        <span className="font-bold text-destructive">₹{(parseFloat(emergencyAmount) * 0.0175).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pt-1.5 sm:pt-2 border-t border-destructive/10 flex justify-between items-center text-xs sm:text-sm">
                        <span className="font-bold text-foreground">Final Payout:</span>
                        <span className="font-extrabold text-foreground">₹{(parseFloat(emergencyAmount) * 0.9825).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">Reason for Emergency (Enter reason in detail)</label>
                  <textarea
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    placeholder="Please describe your emergency situation..."
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-destructive/20 focus:border-destructive outline-none transition-all min-h-[80px] sm:min-h-[100px] resize-none"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                    <FileText size={14} /> Supporting Proof (Image/PDF)
                  </label>
                  <div className="flex flex-col gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 sm:py-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <ArrowUpCircle size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium text-center">
                        {emergencyProof ? emergencyProof.name : "Attach Medical Bills / Proof"}
                      </span>
                    </button>

                    {emergencyProofPreview && (
                      <div className="relative w-full aspect-video h-auto max-h-[180px] sm:h-32 rounded-lg overflow-hidden border border-border shadow-sm">
                        <img src={emergencyProofPreview} alt="Proof preview" className="w-full h-full object-contain bg-muted/20" />
                        <button
                          type="button"
                          onClick={() => { setEmergencyProof(null); setEmergencyProofPreview(null); }}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <p className="text-[10px] text-muted-foreground italic leading-tight">
                      * Emergency bypass is subject to manual verification. Penalty will be deducted from the payout.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fixed Footer Actions */}
              <div className="p-4 border-t border-border bg-muted/20 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEmergency}
                  className="flex-[2] px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg active:scale-[0.98]"
                >
                  {submittingEmergency ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit & Process</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}