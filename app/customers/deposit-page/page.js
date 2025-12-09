"use client";
import { useState } from "react";
import { 
  ArrowDownCircle, 
  QrCode, 
  Upload, 
  Copy, 
  CheckCircle2, 
  Clock,
  X,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import Toast from "@/components/Toast";

// --- Mock Data ---
const depositHistory = [
  { id: "DEP-001", amount: 50000, date: "Today, 2:30 PM", status: "Pending", gold: 6.54, screenshot: null },
  { id: "DEP-002", amount: 25000, date: "Yesterday, 10:15 AM", status: "Approved", gold: 3.27, screenshot: "screenshot1.jpg" },
  { id: "DEP-003", amount: 100000, date: "01 Dec, 3:45 PM", status: "Approved", gold: 13.08, screenshot: "screenshot2.jpg" },
  { id: "DEP-004", amount: 30000, date: "30 Nov, 11:20 AM", status: "Approved", gold: 3.92, screenshot: null },
];

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "text-secondary-foreground bg-secondary border-secondary",
    Approved: "text-primary bg-primary/10 border-primary/20",
  };
  return (
    <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${styles[status] || styles.Pending}`}>
      {status === "Pending" ? <Clock size={10} className="sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" /> : <CheckCircle2 size={10} className="sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />}
      {status}
    </span>
  );
};

export default function DepositPage() {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [upiReference, setUpiReference] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [copied, setCopied] = useState(false);

  const upiId = "kampomido@paytm";
  const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(upiId);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setToast({ message: "Please enter a valid amount", type: "error" });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ message: "Deposit request submitted! Admin will verify and approve.", type: "success" });
      setAmount("");
      setUpiReference("");
      setScreenshot(null);
      setScreenshotPreview(null);
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
                  <img 
                    src={qrCodeUrl} 
                    alt="UPI QR Code" 
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                  />
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
                      value={upiId}
                      readOnly
                      className="flex-1 px-2.5 sm:px-3 py-2 bg-muted border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground"
                    />
                    <button
                      onClick={handleCopyUPI}
                      className="px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-[11px] sm:text-xs md:text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shrink-0"
                    >
                      {copied ? <CheckCircle2 size={14} className="sm:w-4 sm:h-4" /> : <Copy size={14} className="sm:w-4 sm:h-4" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
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

          {/* Deposit Form */}
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
                  <strong className="text-foreground">Note:</strong> After submitting, admin will verify your payment and approve the deposit. 
                  Gold will be credited to your wallet once approved.
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
        </div>

        {/* RIGHT COLUMN: Deposit History (Span 1) */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-6">Deposit History</h3>
            
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              {depositHistory.map((deposit) => (
                <div key={deposit.id} className="p-2.5 sm:p-3 md:p-4 bg-muted/30 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-muted-foreground truncate flex-1 pr-2">{deposit.id}</span>
                    <StatusBadge status={deposit.status} />
                  </div>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <p className="text-base sm:text-lg font-bold text-foreground wrap-break-word">{formatINR(deposit.amount)}</p>
                    <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground shrink-0 ml-2">{deposit.gold} g</p>
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
              ))}
            </div>

            <button className="w-full mt-3 sm:mt-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm border border-border rounded-md text-muted-foreground hover:bg-muted transition-colors">
              View All Deposits
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

    </div>
  );
}

