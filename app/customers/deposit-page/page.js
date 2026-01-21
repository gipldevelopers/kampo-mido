"use client";
import { useState, useEffect } from "react";
import {
  ArrowDownCircle,
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  X,
  Image as ImageIcon,
  Loader2,
  History,
  Lock
} from "lucide-react";
import Link from "next/link";
import Toast from "@/components/Toast";
import DepositService from "../../../services/customer/deposit.service";
import UPIService from "../../../services/upi.service";
import KYCService from "@/services/customer/kyc.service"; // Add this import

const StatusBadge = ({ status }) => {
  // Normalize status to handle both lowercase and capitalized versions
  const normalizedStatus = status ? (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) : "Pending";

  const styles = {
    Pending: "text-secondary-foreground bg-secondary border-secondary",
    Approved: "text-primary bg-primary/10 border-primary/20",
    Rejected: "text-destructive bg-destructive/10 border-destructive/20",
  };

  const getIcon = () => {
    if (normalizedStatus === "Pending") return <Clock size={10} className="sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />;
    if (normalizedStatus === "Rejected") return <X size={10} className="sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />;
    return <CheckCircle2 size={10} className="sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />;
  };

  return (
    <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${styles[normalizedStatus] || styles.Pending}`}>
      {getIcon()}
      {normalizedStatus}
    </span>
  );
};

export default function DepositPage() {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [amount, setAmount] = useState("");
  const [upiReference, setUpiReference] = useState("");
  const [depositDate, setDepositDate] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [depositHistory, setDepositHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [fetchingAllHistory, setFetchingAllHistory] = useState(false);
  const [allDepositHistory, setAllDepositHistory] = useState([]);

  // UPI related states
  const [upiId, setUpiId] = useState("kampomido@paytm"); // Default UPI ID
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [fetchingUPI, setFetchingUPI] = useState(true);
  const [qrCodeError, setQrCodeError] = useState(false);

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

  // Set default deposit date to today
  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setDepositDate(now.toISOString().slice(0, 10));
  }, []);

  // Fetch UPI QR code on mount
  useEffect(() => {
    const fetchUPIQR = async () => {
      setFetchingUPI(true);
      try {
        const response = await UPIService.getUPIQR();

        console.log("UPI QR Response:", response); // Debug log

        if (response.success && response.data) {
          const { upiId: apiUpiId, qrCode: apiQrCode, merchantName } = response.data;

          console.log("UPI Data:", { apiUpiId, hasQrCode: !!apiQrCode, merchantName }); // Debug log

          if (apiUpiId) {
            setUpiId(apiUpiId);
          }

          if (apiQrCode) {
            // Backend returns base64 data URL - use it directly!
            setQrCodeUrl(apiQrCode);
            setQrCodeError(false);
          } else {
            // If no QR code from backend, show error
            setQrCodeError(true);
            setToast({
              message: "QR code not available. Please contact support.",
              type: "error"
            });
          }
        } else {
          // Handle no data case
          setQrCodeError(true);
          setToast({
            message: response.data?.message || "UPI details not configured",
            type: "warning"
          });
        }
      } catch (error) {
        console.error("Error fetching UPI QR:", error);
        setQrCodeError(true);
        // Fallback to default values if API fails
        const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiId)}`;
        setQrCodeUrl(generatedQrUrl);

        // Show toast only if it's not a network error or if you want to show all errors
        if (error.response?.status !== 401) {
          setToast({
            message: "Unable to load UPI details. Using default values.",
            type: "warning"
          });
        }
      } finally {
        setFetchingUPI(false);
      }
    };

    fetchUPIQR();
  }, []);

  // Fetch deposit history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setFetching(true);
      try {
        const response = await DepositService.getDepositHistory();

        // Handle different response structures
        let historyData = [];
        if (response.data && Array.isArray(response.data)) {
          historyData = response.data;
        } else if (Array.isArray(response)) {
          historyData = response;
        } else if (response.deposits && Array.isArray(response.deposits)) {
          historyData = response.deposits;
        }

        // Format history data
        const formattedHistory = historyData.map((item, index) => ({
          id: item.transactionId || item.id || item.depositId || `DEP-${index + 1}`,
          amount: item.amount || 0,
          date: item.depositDate || item.date || item.createdAt
            ? new Date(item.depositDate || item.date || item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
            : "N/A",
          status: item.status || "pending",
          gold: item.goldAmount || item.gold || item.goldGrams || 0,
          screenshot: item.screenshot || null,
          // Only show gold if deposit has been processed (converted)
          isConverted: item.isConverted || (item.goldAmount || item.gold || item.goldGrams) > 0
        }));

        setDepositHistory(formattedHistory);
      } catch (error) {
        console.error("Error fetching deposit history:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch deposit history";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setFetching(false);
      }
    };

    fetchHistory();
  }, []);

  // Fetch all deposit history for modal
  const fetchAllDepositHistory = async () => {
    setFetchingAllHistory(true);
    try {
      const response = await DepositService.getDepositHistory();

      // Handle different response structures
      let historyData = [];
      if (response.data && Array.isArray(response.data)) {
        historyData = response.data;
      } else if (Array.isArray(response)) {
        historyData = response;
      } else if (response.deposits && Array.isArray(response.deposits)) {
        historyData = response.deposits;
      }

      // Format history data
      const formattedHistory = historyData.map((item, index) => ({
        id: item.transactionId || item.id || item.depositId || `DEP-${index + 1}`,
        amount: item.amount || 0,
        date: item.depositDate || item.date || item.createdAt
          ? new Date(item.depositDate || item.date || item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
          : "N/A",
        status: item.status || "pending",
        gold: item.goldAmount || item.gold || item.goldGrams || 0,
        screenshot: item.screenshot || null,
        upiReference: item.upiReference || item.upiRef || "N/A",
        mode: item.mode || "UPI",
        rateUsed: item.rateUsed || item.rate || 0,
        adminNotes: item.adminNotes || item.notes || "",
        isConverted: item.isConverted || (item.goldAmount || item.gold || item.goldGrams) > 0,
        fullData: item
      }));

      setAllDepositHistory(formattedHistory);
    } catch (error) {
      console.error("Error fetching all deposit history:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch deposit history";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setFetchingAllHistory(false);
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setToast({ message: "UPI ID copied to clipboard!", type: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: "Image size should be less than 5MB", type: "error" });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setToast({ message: "Please select a valid image file", type: "error" });
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setToast({ message: "Please enter a valid amount", type: "error" });
      return;
    }
    if (!depositDate) {
      setToast({ message: "Please select a deposit date", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // Convert depositDate to ISO string format
      const depositDateISO = new Date(depositDate).toISOString();

      // Prepare deposit data
      const depositData = {
        amount: Number(amount),
        depositDate: depositDateISO,
      };

      // Add optional fields only if provided
      if (upiReference && upiReference.trim()) {
        depositData.upiReference = upiReference.trim();
      }

      if (screenshot) {
        depositData.screenshot = screenshot;
      }

      // Submit deposit request
      await DepositService.submitDeposit(depositData);

      setToast({ message: "Deposit request submitted! Admin will verify and approve.", type: "success" });

      // Clear form
      setAmount("");
      setUpiReference("");
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setDepositDate(now.toISOString().slice(0, 10));
      setScreenshot(null);
      setScreenshotPreview(null);

      // Refresh deposit history
      try {
        const response = await DepositService.getDepositHistory();
        let historyData = [];
        if (response.data && Array.isArray(response.data)) {
          historyData = response.data;
        } else if (Array.isArray(response)) {
          historyData = response;
        } else if (response.deposits && Array.isArray(response.deposits)) {
          historyData = response.deposits;
        }

        const formattedHistory = historyData.map((item, index) => ({
          id: item.transactionId || item.id || item.depositId || `DEP-${index + 1}`,
          amount: item.amount || 0,
          date: item.depositDate || item.date || item.createdAt
            ? new Date(item.depositDate || item.date || item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
            : "N/A",
          status: item.status || "pending",
          gold: item.goldAmount || item.gold || item.goldGrams || 0,
          screenshot: item.screenshot || null,
          isConverted: item.isConverted || (item.goldAmount || item.gold || item.goldGrams) > 0
        }));

        setDepositHistory(formattedHistory);
      } catch (historyError) {
        console.error("Error refreshing deposit history:", historyError);
      }

    } catch (error) {
      console.error("Error submitting deposit:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit deposit request";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatGold = (gold) => {
    if (!gold || gold === 0) return "0.0000";
    return parseFloat(gold).toFixed(4);
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Deposit Money</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">Transfer funds via UPI to add gold to your wallet.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">

        {/* LEFT COLUMN: Deposit Form (Span 2) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">

          {/* UPI Payment Section */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
              <QrCode size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">UPI Payment</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {/* QR Code */}
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-background p-3 sm:p-4 md:p-6 rounded-lg border border-border flex items-center justify-center">
                  {fetchingUPI ? (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center">
                      <Loader2 size={32} className="animate-spin text-muted-foreground" />
                    </div>
                  ) : qrCodeError ? (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex flex-col items-center justify-center">
                      <QrCode size={48} className="text-destructive mb-2" />
                      <p className="text-xs text-muted-foreground text-center">Failed to load QR</p>
                    </div>
                  ) : (
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                      onError={(e) => {
                        console.error("Failed to load QR code image");
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex flex-col items-center justify-center">
                            <svg class="w-12 h-12 text-destructive mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p class="text-xs text-muted-foreground text-center">QR code unavailable</p>
                          </div>
                        `;
                      }}
                    />
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-center text-muted-foreground">Scan QR code to pay</p>
              </div>

              {/* UPI ID */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">UPI ID</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={fetchingUPI ? "Loading..." : upiId}
                      readOnly
                      className="flex-1 px-2.5 sm:px-3 py-2 bg-muted border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground"
                      disabled={fetchingUPI}
                    />
                    <button
                      onClick={handleCopyUPI}
                      disabled={fetchingUPI || !upiId}
                      className="px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-[11px] sm:text-xs md:text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {fetchingUPI ? (
                        <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" />
                      ) : copied ? (
                        <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
                      ) : (
                        <Copy size={14} className="sm:w-4 sm:h-4" />
                      )}
                      <span>
                        {fetchingUPI ? "Loading" : copied ? "Copied!" : "Copy"}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 p-3 sm:p-4 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 font-medium">Payment Instructions:</p>
                  <ul className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground space-y-0.5 sm:space-y-1 list-disc list-inside">
                    <li>Use any UPI app (Paytm, PhonePe, Google Pay, etc.)</li>
                    <li>Scan QR code or enter UPI ID manually</li>
                    <li>Enter the exact amount you want to deposit</li>
                    <li>Complete the payment</li>
                    <li>Upload payment screenshot (optional but recommended)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Form or KYC Lock */}
          {checkingKYC ? (
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-8 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : !kycVerified ? (
            <div className="bg-card border border-destructive/20 rounded-lg sm:rounded-xl p-6 md:p-10 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">KYC Verification Required</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                To ensure security and compliance, you must complete your KYC verification before making any deposits.
              </p>
              <div className="pt-2">
                <Link href="/customers/kyc-page" className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity">
                  Complete Verification
                </Link>
              </div>
            </div>
          ) : (
            /* Deposit Form */
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
                <ArrowDownCircle size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Submit Deposit Request</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Amount Deposited (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount transferred"
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                    min="1"
                  />
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">Enter the exact amount you transferred via UPI</p>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">UPI Transaction Reference (Optional)</label>
                  <input
                    type="text"
                    value={upiReference}
                    onChange={(e) => setUpiReference(e.target.value)}
                    placeholder="Transaction ID from your payment app"
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">Help us verify your payment faster</p>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Deposit Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={depositDate}
                      onChange={(e) => setDepositDate(e.target.value)}
                      className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none"
                      required
                    />
                  </div>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">Select the date when you made the payment</p>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Payment Screenshot (Optional)</label>
                  {screenshotPreview ? (
                    <div className="relative">
                      <div className="border border-border rounded-lg p-2 sm:p-3 md:p-4 bg-muted/30">
                        <img
                          src={screenshotPreview}
                          alt="Payment screenshot"
                          className="max-w-full h-auto max-h-48 sm:max-h-56 md:max-h-64 rounded-md"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
                        aria-label="Remove screenshot"
                      >
                        <X size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center w-full px-3 sm:px-4 py-6 sm:py-8 bg-muted/30 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors">
                        <ImageIcon size={24} className="sm:w-8 sm:h-8 text-muted-foreground mb-1.5 sm:mb-2" />
                        <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-0.5 sm:mb-1">Click to upload screenshot</p>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">PNG, JPG or GIF (Max 5MB)</p>
                      </div>
                    </label>
                  )}
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">Upload payment confirmation screenshot for faster verification</p>
                </div>

                <div className="bg-muted/30 p-3 sm:p-4 rounded-lg border border-border">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> After submitting, admin will verify your payment, approve the deposit, and then process it to convert to gold.
                    Gold will be credited to your wallet once the deposit is processed.
                  </p>
                </div>

                <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-[11px] sm:text-xs md:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownCircle size={14} className="sm:w-4 sm:h-4" /> <span>Submit Deposit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Deposit History (Span 1) */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">

          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-6">Deposit History</h3>

            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {fetching ? (
                <div className="p-3 sm:p-4 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
              ) : depositHistory.length > 0 ? (
                depositHistory.map((deposit) => (
                  <div key={deposit.id} className="p-2.5 sm:p-3 md:p-4 bg-muted/30 border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-muted-foreground truncate flex-1 pr-2">{deposit.id}</span>
                      <StatusBadge status={deposit.status} />
                    </div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <p className="text-base sm:text-lg font-bold text-foreground wrap-break-word">{formatINR(deposit.amount)}</p>
                      {deposit.isConverted && deposit.gold > 0 && (
                        <p className="text-[11px] sm:text-xs md:text-sm text-primary font-medium shrink-0 ml-2">{formatGold(deposit.gold)} g</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                      <span className="truncate flex-1 pr-2">{deposit.date}</span>
                      {deposit.screenshot && (
                        <span className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                          <ImageIcon size={10} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Screenshot</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 sm:p-4 text-center text-sm text-muted-foreground">
                  No deposit history available
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (!showAllHistory) {
                  fetchAllDepositHistory();
                }
                setShowAllHistory(!showAllHistory);
              }}
              className="w-full mt-3 sm:mt-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm border border-border rounded-md text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <History size={12} className="sm:w-4 sm:h-4" />
              <span>{showAllHistory ? "Hide All Deposits" : "View All Deposits"}</span>
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Deposit Process</p>
            <ul className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground space-y-0.5 sm:space-y-1 list-disc list-inside">
              <li>Transfer money via UPI</li>
              <li>Submit deposit request</li>
              <li>Admin verifies payment</li>
              <li>Gold credited to wallet</li>
            </ul>
          </div>

        </div>

      </div>

      {/* All Deposit History Section */}
      {
        showAllHistory && (
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <History size={18} className="sm:w-5 sm:h-5 text-primary" />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold">All Deposit History</h3>
              </div>
              <button
                onClick={() => setShowAllHistory(false)}
                className="p-1.5 hover:bg-muted rounded-full transition-colors"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {fetchingAllHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : allDepositHistory.length > 0 ? (
              <div className="space-y-3">
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {allDepositHistory.map((deposit) => (
                    <div key={deposit.id} className="p-3 sm:p-4 bg-muted/30 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-foreground">{deposit.id}</span>
                        <StatusBadge status={deposit.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Amount</p>
                          <p className="text-sm font-semibold text-foreground">{formatINR(deposit.amount)}</p>
                        </div>
                        {deposit.isConverted && deposit.gold > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground">Gold</p>
                            <p className="text-sm font-medium text-primary">{deposit.gold} g</p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Date</p>
                          <p className="text-xs text-foreground">{deposit.date}</p>
                        </div>
                        {deposit.rateUsed > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground">Rate</p>
                            <p className="text-xs text-foreground">₹ {deposit.rateUsed.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      {deposit.upiReference && deposit.upiReference !== "N/A" && (
                        <div className="mb-2">
                          <p className="text-[10px] text-muted-foreground">UPI Reference</p>
                          <p className="text-xs text-foreground">{deposit.upiReference}</p>
                        </div>
                      )}
                      {deposit.screenshot && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ImageIcon size={12} />
                          <span>Screenshot available</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 font-medium">Transaction ID</th>
                        <th className="px-4 py-2 font-medium">Amount</th>
                        <th className="px-4 py-2 font-medium">Gold</th>
                        <th className="px-4 py-2 font-medium">Date</th>
                        <th className="px-4 py-2 font-medium">Rate</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {allDepositHistory.map((deposit) => (
                        <tr key={deposit.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{deposit.id}</td>
                          <td className="px-4 py-3 font-semibold">{formatINR(deposit.amount)}</td>
                          <td className="px-4 py-3 text-primary font-medium">
                            {deposit.isConverted && deposit.gold > 0 ? `${deposit.gold} g` : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{deposit.date}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {deposit.rateUsed > 0 ? `₹ ${deposit.rateUsed.toLocaleString()}` : "N/A"}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={deposit.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No deposit history available</p>
              </div>
            )}
          </div>
        )
      }

    </div >
  );
}