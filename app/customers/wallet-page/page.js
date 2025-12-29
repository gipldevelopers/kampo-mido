"use client";
import { useState, useEffect } from "react";
import {
  Wallet,
  Coins,
  TrendingUp,
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import walletService from "@/services/customer/wallet.service";

const StatusBadge = ({ status }) => {
  return (
    <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border text-primary bg-primary/10 border-primary/20 flex items-center gap-0.5 sm:gap-1 w-fit">
      <CheckCircle2 size={10} className="sm:w-3 sm:h-3" />
      {status}
    </span>
  );
};

export default function WalletPage() {
  // State for wallet data
  const [wallet, setWallet] = useState({
    totalGrams: 0,
    currentValue: 0,
    currentGoldRate: 0,
    averageBuyRate: 0,
    totalDeposited: 0,
    profitLoss: 0,
    profitLossPercent: 0
  });

  // State for conversion history
  const [conversionHistory, setConversionHistory] = useState([]);

  // State for loading and error
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const formatINR = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (typeof num !== 'number') return "0";
    return num.toLocaleString('en-IN');
  };

  // Format date from API
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      // Handle different date formats
      if (dateString.includes(',')) {
        // Already formatted date like "13 Dec 2025, 5:30 am"
        return dateString;
      }

      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return `Today, ${date.toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`;
      } else if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`;
      } else {
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ', ' + date.toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Fetch wallet data
  const fetchWalletData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      if (isRefresh) setRefreshing(true);
      setError(null);

      // Fetch wallet summary which contains all the data
      const summaryResponse = await walletService.getWalletSummary();

      if (summaryResponse.success && summaryResponse.data) {
        const { wallet: walletData, recentConversions } = summaryResponse.data;

        // Set wallet stats
        if (walletData) {
          setWallet({
            totalGrams: walletData.totalGrams || 0,
            currentValue: walletData.currentValue || 0,
            currentGoldRate: walletData.currentGoldRate || 0,
            averageBuyRate: walletData.averageBuyRate || 0,
            totalDeposited: walletData.totalDeposited || 0,
            profitLoss: walletData.profitLoss || 0,
            profitLossPercent: walletData.profitLossPercent || 0
          });
        }

        // Set conversion history
        if (recentConversions) {
          setConversionHistory(recentConversions);
        }
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setError("Failed to load wallet data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch additional data
  const fetchAdditionalData = async () => {
    try {
      // Optional: Fetch current gold rate for updated timestamp
      const goldRateResponse = await walletService.getCurrentGoldRate();
      if (goldRateResponse.success && goldRateResponse.data) {
        // Update current gold rate if needed
        setWallet(prev => ({
          ...prev,
          currentGoldRate: goldRateResponse.data.ratePerGram || prev.currentGoldRate
        }));
      }
    } catch (error) {
      console.error("Error fetching additional data:", error);
      // Don't fail the whole page if additional data fails
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchWalletData();
      await fetchAdditionalData();
    };
    loadData();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    await fetchWalletData(true);
    await fetchAdditionalData();
  };

  // Format gold amount
  const formatGold = (grams) => {
    if (!grams && grams !== 0) return "0.00 g";
    return `${parseFloat(grams).toFixed(3)} g`;
  };

  // Format percentage
  const formatPercentage = (percent) => {
    if (!percent && percent !== 0) return "0.00%";
    return `${percent >= 0 ? '+' : ''}${parseFloat(percent).toFixed(2)}%`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
            <p className="font-medium">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">

      {/* Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">My Wallet</h2>
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
            View your gold holdings and conversion history.
          </p>
        </div>
        {refreshing && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Refreshing...
          </div>
        )}
      </div>

      {/* Wallet Stats Grid */}
      <div className="grid gap-2.5 sm:gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Grams */}
        <div className="bg-card text-card-foreground p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate flex-1 pr-1">Total Gold</span>
            <div className="p-1 sm:p-1.5 md:p-2 bg-primary/10 rounded-md sm:rounded-lg shrink-0">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
            </div>
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold wrap-break-word">
            {formatGold(wallet.totalGrams)}
          </div>
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Your gold holdings</p>
        </div>

        {/* Current Value */}
        <div className="bg-card text-card-foreground p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate flex-1 pr-1">Current Value</span>
            <div className="p-1 sm:p-1.5 md:p-2 bg-primary/10 rounded-md sm:rounded-lg shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
            </div>
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold wrap-break-word">
            {formatINR(wallet.currentValue)}
          </div>
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Based on current rate</p>
        </div>

        {/* Current Gold Rate */}
        <div className="bg-card text-card-foreground p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate flex-1 pr-1">Gold Rate</span>
            <div className="p-1 sm:p-1.5 md:p-2 bg-primary/10 rounded-md sm:rounded-lg shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
            </div>
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold wrap-break-word">
            ₹{formatNumber(wallet.currentGoldRate)}
          </div>
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Per gram</p>
        </div>

        {/* Profit/Loss */}
        <div className="bg-card text-card-foreground p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate flex-1 pr-1">Net Gain / Loss</span>
            <div className="p-1 sm:p-1.5 md:p-2 bg-primary/10 rounded-md sm:rounded-lg shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
            </div>
          </div>
          <div className={`text-lg sm:text-xl md:text-2xl font-bold wrap-break-word ${wallet.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {wallet.profitLoss >= 0 ? '+' : ''}{formatINR(wallet.profitLoss)}
          </div>
          <p className={`text-[9px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 ${wallet.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatPercentage(wallet.profitLossPercent)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">

        {/* LEFT COLUMN: Wallet Details (Span 2) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">

          {/* Wallet Summary */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
              <Wallet size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Wallet Summary</h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Total Gold Holdings</p>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">All your gold assets</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-primary shrink-0 sm:ml-2">
                  {formatGold(wallet.totalGrams)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Current Market Value</p>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Based on current gold rate</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-primary shrink-0 sm:ml-2 wrap-break-word">
                  {formatINR(wallet.currentValue)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                <div className="p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1">Average Buy Rate</p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-foreground wrap-break-word">
                    ₹{formatNumber(wallet.averageBuyRate)}/g
                  </p>
                </div>
                <div className="p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1">Current Gold Rate</p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-foreground wrap-break-word">
                    ₹{formatNumber(wallet.currentGoldRate)}/g
                  </p>
                </div>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg border ${wallet.profitLoss >= 0
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-destructive/10 border-destructive/20'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Total Return</p>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Profit/Loss on investment</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0 sm:ml-2">
                    <p className={`text-lg sm:text-xl font-bold flex items-center gap-1 ${wallet.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'
                      }`}>
                      {wallet.profitLoss >= 0 ? <TrendingUp size={16} className="sm:w-5 sm:h-5" /> : <TrendingUp size={16} className="sm:w-5 sm:h-5 rotate-180" />}
                      {wallet.profitLoss >= 0 ? '+' : ''}{formatINR(wallet.profitLoss)}
                    </p>
                    <p className={`text-[9px] sm:text-[10px] md:text-xs font-medium ${wallet.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'
                      }`}>
                      {formatPercentage(wallet.profitLossPercent)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion History */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
              <ArrowRightLeft size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Conversion History</h3>
              {conversionHistory.length > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {conversionHistory.length} records
                </span>
              )}
            </div>

            <div className="overflow-x-auto -mx-3 sm:mx-0">
              {conversionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-muted/30 rounded-lg p-6 max-w-sm mx-auto">
                    <ArrowRightLeft className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">No conversion history yet</p>
                    <p className="text-xs text-muted-foreground">
                      Your deposit conversions will appear here
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="block md:hidden space-y-2.5 sm:space-y-3">
                    {conversionHistory.map((conversion) => (
                      <div key={conversion.id} className="p-3 sm:p-4 bg-muted/30 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                            {formatDate(conversion.date)}
                          </span>
                          <StatusBadge status={conversion.status} />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${conversion.type === 'Deposit'
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            }`}>
                            {conversion.type}
                          </span>
                          <span className="text-sm sm:text-base font-semibold">
                            {formatINR(conversion.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                          <span>{formatGold(conversion.gold)}</span>
                          <span>₹{formatNumber(conversion.rate)}/g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium text-xs">Date & Time</th>
                          <th className="px-4 py-3 font-medium text-xs">Type</th>
                          <th className="px-4 py-3 font-medium text-xs">Amount (₹)</th>
                          <th className="px-4 py-3 font-medium text-xs">Gold (g)</th>
                          <th className="px-4 py-3 font-medium text-xs">Rate</th>
                          <th className="px-4 py-3 font-medium text-xs text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {conversionHistory.map((conversion) => (
                          <tr key={conversion.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-4 text-xs text-muted-foreground">
                              {formatDate(conversion.date)}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${conversion.type === 'Deposit'
                                  ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                  : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                }`}>
                                {conversion.type}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-semibold text-xs">
                              {formatINR(conversion.amount)}
                            </td>
                            <td className="px-4 py-4 font-medium text-xs">
                              {formatGold(conversion.gold)}
                            </td>
                            <td className="px-4 py-4 text-xs text-muted-foreground">
                              ₹{formatNumber(conversion.rate)}/g
                            </td>
                            <td className="px-4 py-4 text-right">
                              <StatusBadge status={conversion.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Info (Span 1) */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">

          {/* Gold Rate Info */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Gold Rate Information</h3>

            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1">Current Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-primary wrap-break-word">
                  ₹{formatNumber(wallet.currentGoldRate)}/g
                </p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-1.5 sm:mt-2">
                  Updated: {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="p-3 sm:p-4 bg-muted/30 border border-border rounded-lg">
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1">Your Average Rate</p>
                <p className="text-base sm:text-lg font-bold text-foreground wrap-break-word">
                  ₹{formatNumber(wallet.averageBuyRate)}/g
                </p>
              </div>

              <div className="p-3 sm:p-4 bg-muted/30 border border-border rounded-lg">
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1">Total Deposited</p>
                <p className="text-base sm:text-lg font-bold text-foreground wrap-break-word">
                  {formatINR(wallet.totalDeposited)}
                </p>
              </div>

              {/* Profit/Loss Summary */}
              <div className={`p-3 sm:p-4 rounded-lg border ${wallet.profitLoss >= 0
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-destructive/10 border-destructive/20'
                }`}>
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-md ${wallet.profitLoss >= 0 ? 'bg-green-100' : 'bg-destructive/10'}`}>
                    {wallet.profitLoss >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-foreground">
                      {wallet.profitLoss >= 0 ? 'Investment Gain' : 'Investment Loss'}
                    </p>
                    <p className={`text-xs font-bold ${wallet.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {wallet.profitLoss >= 0 ? '+' : ''}{formatINR(wallet.profitLoss)} ({formatPercentage(wallet.profitLossPercent)})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-1.5 sm:mb-2">How It Works</p>
            <ul className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground space-y-0.5 sm:space-y-1 list-disc list-inside">
              <li>Deposit money via UPI</li>
              <li>Amount converted to gold at current rate</li>
              <li>Gold added to your wallet</li>
              <li>Track all conversions here</li>
            </ul>
          </div>

          {/* Empty State for No Gold */}
          {wallet.totalGrams === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">Start Your Gold Journey</p>
                  <p className="text-xs text-amber-700">
                    You haven't purchased any gold yet. Make your first deposit to start investing in gold.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Investment Status */}
          {wallet.totalGrams > 0 && (
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-foreground mb-2">Investment Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">Total Investment:</span>
                  <span className="text-xs font-medium text-foreground">{formatINR(wallet.totalDeposited)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">Current Value:</span>
                  <span className="text-xs font-medium text-foreground">{formatINR(wallet.currentValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">Gold Holdings:</span>
                  <span className="text-xs font-medium text-foreground">{formatGold(wallet.totalGrams)}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Overall Return:</span>
                    <span className={`text-xs font-bold ${wallet.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {formatPercentage(wallet.profitLossPercent)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}