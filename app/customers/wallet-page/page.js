"use client";
import { useState } from "react";
import { 
  Wallet, 
  Coins, 
  TrendingUp,
  ArrowRightLeft,
  CheckCircle2
} from "lucide-react";

// --- Mock Data ---
const conversionHistory = [
  { id: "CONV-001", date: "Today, 2:30 PM", amount: 50000, gold: 6.54, rate: 7645, type: "Deposit", status: "Completed" },
  { id: "CONV-002", date: "Yesterday, 10:15 AM", amount: 25000, gold: 3.27, rate: 7645, type: "Deposit", status: "Completed" },
  { id: "CONV-003", date: "01 Dec, 3:45 PM", amount: 100000, gold: 13.08, rate: 7645, type: "Deposit", status: "Completed" },
  { id: "CONV-004", date: "30 Nov, 11:20 AM", amount: 30000, gold: 3.92, rate: 7645, type: "Deposit", status: "Completed" },
  { id: "CONV-005", date: "29 Nov, 4:20 PM", amount: 50000, gold: 6.64, rate: 7520, type: "Conversion", status: "Completed" },
];

const StatusBadge = ({ status }) => {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border text-primary bg-primary/10 border-primary/20 flex items-center gap-1 w-fit">
      <CheckCircle2 size={12} />
      {status}
    </span>
  );
};

export default function WalletPage() {
  // Wallet Stats
  const [wallet] = useState({
    totalGrams: 32.5,
    currentValue: 254200,
    currentGoldRate: 7645,
    averageBuyRate: 7692,
    totalDeposited: 250000,
    profitLoss: 4200,
    profitLossPercent: 1.68
  });

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">My Wallet</h2>
          <p className="text-sm text-muted-foreground">View your gold holdings and conversion history.</p>
        </div>
      </div>

      {/* Wallet Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Grams */}
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Total Gold</span>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Coins className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">{wallet.totalGrams} g</div>
          <p className="text-xs text-muted-foreground mt-1">Your gold holdings</p>
        </div>

        {/* Current Value */}
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Current Value</span>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">{formatINR(wallet.currentValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">Based on current rate</p>
        </div>

        {/* Current Gold Rate */}
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Gold Rate</span>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="text-2xl font-bold">₹{wallet.currentGoldRate.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Per gram</p>
        </div>

        {/* Profit/Loss */}
        <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Net Gain / Loss</span>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${wallet.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {wallet.profitLoss >= 0 ? '+' : ''}{formatINR(wallet.profitLoss)}
          </div>
          <p className={`text-xs mt-1 ${wallet.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {wallet.profitLoss >= 0 ? '+' : ''}{wallet.profitLossPercent}%
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Wallet Details (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Wallet Summary */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Wallet size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Wallet Summary</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Total Gold Holdings</p>
                  <p className="text-xs text-muted-foreground mt-1">All your gold assets</p>
                </div>
                <p className="text-xl font-bold text-primary">{wallet.totalGrams} g</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Current Market Value</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on current gold rate</p>
                </div>
                <p className="text-xl font-bold text-primary">{formatINR(wallet.currentValue)}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Average Buy Rate</p>
                  <p className="text-lg font-bold text-foreground">₹{wallet.averageBuyRate.toLocaleString()}/g</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Current Gold Rate</p>
                  <p className="text-lg font-bold text-foreground">₹{wallet.currentGoldRate.toLocaleString()}/g</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                wallet.profitLoss >= 0 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-destructive/10 border-destructive/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Total Return</p>
                    <p className="text-xs text-muted-foreground mt-1">Profit/Loss on investment</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold flex items-center gap-1 ${
                      wallet.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'
                    }`}>
                      {wallet.profitLoss >= 0 ? <TrendingUp size={20} /> : <TrendingUp size={20} className="rotate-180" />}
                      {wallet.profitLoss >= 0 ? '+' : ''}{formatINR(wallet.profitLoss)}
                    </p>
                    <p className={`text-xs font-medium ${
                      wallet.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'
                    }`}>
                      {wallet.profitLoss >= 0 ? '+' : ''}{wallet.profitLossPercent}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion History */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <ArrowRightLeft size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Conversion History</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date & Time</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Amount (₹)</th>
                    <th className="px-4 py-3 font-medium">Gold (g)</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {conversionHistory.map((conversion) => (
                    <tr key={conversion.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4 text-muted-foreground">{conversion.date}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          conversion.type === 'Deposit' 
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        }`}>
                          {conversion.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold">{formatINR(conversion.amount)}</td>
                      <td className="px-4 py-4 font-medium">{conversion.gold} g</td>
                      <td className="px-4 py-4 text-muted-foreground">₹{conversion.rate.toLocaleString()}/g</td>
                      <td className="px-4 py-4 text-right">
                        <StatusBadge status={conversion.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Info (Span 1) */}
        <div className="space-y-6">
          
          {/* Gold Rate Info */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Gold Rate Information</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Current Rate</p>
                <p className="text-2xl font-bold text-primary">₹{wallet.currentGoldRate.toLocaleString()}/g</p>
                <p className="text-xs text-muted-foreground mt-2">Updated: Today, 09:00 AM</p>
              </div>

              <div className="p-4 bg-muted/30 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Your Average Rate</p>
                <p className="text-lg font-bold text-foreground">₹{wallet.averageBuyRate.toLocaleString()}/g</p>
              </div>

              <div className="p-4 bg-muted/30 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Deposited</p>
                <p className="text-lg font-bold text-foreground">{formatINR(wallet.totalDeposited)}</p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-2">How It Works</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Deposit money via UPI</li>
              <li>Amount converted to gold at current rate</li>
              <li>Gold added to your wallet</li>
              <li>Track all conversions here</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}

