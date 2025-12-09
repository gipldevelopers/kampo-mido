"use client";
import { useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Coins,
  DollarSign,
  Activity
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// --- Mock Data ---

// 7 Days Gold Value Data
const goldValue7Days = [
  { day: 'Mon', value: 245000, gold: 32.5 },
  { day: 'Tue', value: 248500, gold: 32.5 },
  { day: 'Wed', value: 246200, gold: 32.5 },
  { day: 'Thu', value: 251000, gold: 32.5 },
  { day: 'Fri', value: 253500, gold: 32.5 },
  { day: 'Sat', value: 250800, gold: 32.5 },
  { day: 'Sun', value: 254200, gold: 32.5 },
];

// 30 Days Gold Value Data
const goldValue30Days = [
  { day: '1', value: 230000, gold: 32.5 },
  { day: '5', value: 235000, gold: 32.5 },
  { day: '10', value: 240000, gold: 32.5 },
  { day: '15', value: 245000, gold: 32.5 },
  { day: '20', value: 248000, gold: 32.5 },
  { day: '25', value: 250000, gold: 32.5 },
  { day: '30', value: 254200, gold: 32.5 },
];

// --- Reusable Components ---

const StatCard = ({ title, value, subtext, icon: Icon, trend }) => (
  <div className="bg-card text-card-foreground p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate flex-1 pr-2">{title}</span>
      <div className="p-1 sm:p-1.5 md:p-2 bg-primary/10 rounded-md sm:rounded-lg shrink-0">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
      </div>
    </div>
    <div className="text-lg sm:text-xl md:text-2xl font-bold wrap-break-word">{value}</div>
    {subtext && (
      <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
        <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">{subtext}</p>
        {trend && (
          <span className={`text-[9px] sm:text-[10px] md:text-xs font-medium flex items-center gap-0.5 sm:gap-1 ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {trend > 0 ? <TrendingUp size={9} className="sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" /> : trend < 0 ? <TrendingDown size={9} className="sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" /> : null}
            {trend !== 0 && `${Math.abs(trend)}%`}
          </span>
        )}
      </div>
    )}
  </div>
);

export default function CustomerDashboard() {
  const [chartPeriod, setChartPeriod] = useState("7days"); // '7days' or '30days'

  // Customer Stats
  const [stats] = useState({
    totalDeposited: 250000,
    totalGoldGrams: 32.5,
    currentGoldValue: 254200,
    profitLoss: 4200,
    profitLossPercent: 1.68,
    currentGoldRate: 7645
  });

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const chartData = chartPeriod === "7days" ? goldValue7Days : goldValue30Days;
  const chartTitle = chartPeriod === "7days" ? "Gold Value Trend (Last 7 Days)" : "Gold Value Trend (Last 30 Days)";

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500 pb-4 sm:pb-6 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">Welcome back! Here's your portfolio overview.</p>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid gap-2.5 sm:gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Deposited */}
        <StatCard 
          title="Total Deposited" 
          value={formatINR(stats.totalDeposited)}
          subtext="Total amount invested"
          icon={Wallet}
        />
        
        {/* Total Gold Grams */}
        <StatCard 
          title="Total Gold (g)" 
          value={`${stats.totalGoldGrams} g`}
          subtext="Your gold holdings"
          icon={Coins}
        />
        
        {/* Current Gold Value */}
        <StatCard 
          title="Current Gold Value" 
          value={formatINR(stats.currentGoldValue)}
          subtext={`Rate: ₹${stats.currentGoldRate.toLocaleString()}/g`}
          icon={DollarSign}
          trend={stats.profitLossPercent}
        />
        
        {/* Profit/Loss */}
        <StatCard 
          title="Profit / Loss" 
          value={formatINR(Math.abs(stats.profitLoss))}
          subtext={stats.profitLoss >= 0 ? "Total profit" : "Total loss"}
          icon={stats.profitLoss >= 0 ? TrendingUp : TrendingDown}
          trend={stats.profitLossPercent}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-card rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg">{chartTitle}</h3>
          <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setChartPeriod("7days")}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-xs md:text-sm font-medium transition-all ${
                chartPeriod === "7days"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-input text-foreground hover:bg-muted"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setChartPeriod("30days")}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-xs md:text-sm font-medium transition-all ${
                chartPeriod === "30days"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-input text-foreground hover:bg-muted"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
        <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGoldValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.7686 0.1647 70.0804)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.7686 0.1647 70.0804)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="day" 
                stroke="var(--muted-foreground)" 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 10 }}
                className="text-[10px] sm:text-xs"
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                tickLine={false} 
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 10 }}
                className="text-[10px] sm:text-xs"
                width={45}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderColor: 'var(--border)', 
                  borderRadius: '8px',
                  fontSize: '12px',
                  padding: '8px 12px'
                }}
                itemStyle={{ color: 'var(--foreground)', fontSize: '12px' }}
                formatter={(value) => [formatINR(value), 'Gold Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="oklch(0.7686 0.1647 70.0804)" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorGoldValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Portfolio Details */}
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-6">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary shrink-0" />
            <h3 className="font-semibold text-sm sm:text-base md:text-lg">Portfolio Summary</h3>
          </div>
          <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground">Initial Investment</p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Total amount deposited</p>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-bold text-foreground shrink-0 sm:ml-2">{formatINR(stats.totalDeposited)}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground">Current Value</p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Based on current gold rate</p>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-bold text-primary shrink-0 sm:ml-2">{formatINR(stats.currentGoldValue)}</p>
            </div>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 p-2.5 sm:p-3 md:p-4 rounded-lg border ${
              stats.profitLoss >= 0 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-destructive/10 border-destructive/20'
            }`}>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground">Net Gain / Loss</p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Total return on investment</p>
              </div>
              <div className="text-left sm:text-right shrink-0 sm:ml-2">
                <p className={`text-sm sm:text-base md:text-lg font-bold flex items-center gap-1 ${
                  stats.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'
                }`}>
                  {stats.profitLoss >= 0 ? <TrendingUp size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" /> : <TrendingDown size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />}
                  {formatINR(stats.profitLoss)}
                </p>
                <p className={`text-[9px] sm:text-[10px] md:text-xs font-medium ${
                  stats.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'
                }`}>
                  {stats.profitLoss >= 0 ? '+' : ''}{stats.profitLossPercent}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-6">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary shrink-0" />
            <h3 className="font-semibold text-sm sm:text-base md:text-lg">Gold Holdings</h3>
          </div>
          <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
            <div className="p-2.5 sm:p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">Total Gold</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{stats.totalGoldGrams} g</p>
              </div>
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                <span>Current Rate</span>
                <span className="font-medium">₹{stats.currentGoldRate.toLocaleString()}/g</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1">Average Buy Rate</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-foreground wrap-break-word">₹7,692/g</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1">Current Rate</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-foreground wrap-break-word">₹{stats.currentGoldRate.toLocaleString()}/g</p>
              </div>
            </div>
            <div className="p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground">Total Value</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-primary wrap-break-word">{formatINR(stats.currentGoldValue)}</p>
              </div>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                Calculated at current market rate
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

