"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; // Add this import
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  DollarSign,
  Activity,
  Loader2
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import dashboardService from "../../../services/customer/dashboard.service";

// Reusable Components
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
        {trend !== undefined && trend !== null && (
          <span className={`text-[9px] sm:text-[10px] md:text-xs font-medium flex items-center gap-0.5 sm:gap-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
            {trend > 0 ? <TrendingUp size={9} className="sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" /> : trend < 0 ? <TrendingDown size={9} className="sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" /> : null}
            {trend !== 0 && `${trend > 0 ? '+' : ''}${Math.abs(trend)}%`}
          </span>
        )}
      </div>
    )}
  </div>
);

export default function CustomerDashboard() {
  const router = useRouter(); // Initialize router
  const [chartPeriod, setChartPeriod] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalDeposited: 0,
      totalGoldGrams: 0,
      currentGoldValue: 0,
      profitLoss: 0,
      profitLossPercent: 0,
      currentGoldRate: 0,
      averageBuyRate: 0
    },
    trend: [],
    transactions: [],
    quickStats: {
      totalInvestments: 0,
      totalWithdrawals: 0,
      totalTransactions: 0,
      averageMonthlyInvestment: 0,
      lastInvestmentDays: 'N/A',
      goldPerTransaction: 0
    }
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/login');
        return false;
      }
      return true;
    };
    
    if (!checkAuth()) {
      return;
    }
  }, [router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        setSessionExpired(false);

        // Check token before making API calls
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const [summaryRes, trendRes, transactionsRes, quickStatsRes] = await Promise.all([
          dashboardService.getDashboardSummary(),
          dashboardService.getGoldValueTrend(chartPeriod),
          dashboardService.getRecentTransactions(),
          dashboardService.getQuickStats()
        ]);

        setDashboardData({
          summary: summaryRes.data,
          trend: trendRes.data,
          transactions: transactionsRes.data,
          quickStats: quickStatsRes.data
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        
        // Handle session expiry
        if (err.message === 'SESSION_EXPIRED' || err.response?.status === 401) {
          setSessionExpired(true);
          setError("Your session has expired. Please login again.");
          
          // Clear storage and redirect after delay
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
          }, 3000);
        } else {
          setError("Failed to load dashboard data. Please try again.");
          
          // Set mock data for development
          setDashboardData({
            summary: {
              totalDeposited: 250000,
              totalGoldGrams: 32.5,
              currentGoldValue: 254200,
              profitLoss: 4200,
              profitLossPercent: 1.68,
              currentGoldRate: 7645,
              averageBuyRate: 7692
            },
            trend: [],
            transactions: [],
            quickStats: {
              totalInvestments: 5,
              totalWithdrawals: 2,
              totalTransactions: 7,
              averageMonthlyInvestment: 50000,
              lastInvestmentDays: 15,
              goldPerTransaction: 6.5
            }
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [chartPeriod, router]);

  // Handle chart period change
  const handleChartPeriodChange = async (period) => {
    setChartPeriod(period);
    try {
      const response = await dashboardService.getGoldValueTrend(period);
      setDashboardData(prev => ({
        ...prev,
        trend: response.data
      }));
    } catch (err) {
      console.error("Error fetching trend data:", err);
      if (err.message === 'SESSION_EXPIRED' || err.response?.status === 401) {
        setSessionExpired(true);
        setError("Session expired. Please login again.");
        setTimeout(() => {
          localStorage.clear();
          router.push('/login');
        }, 2000);
      }
    }
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const chartTitle = chartPeriod === "7days" ? "Gold Value Trend (Last 7 Days)" : "Gold Value Trend (Last 30 Days)";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (sessionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-amber-500/10 text-amber-600 p-6 rounded-lg mb-4 max-w-md">
            <h3 className="font-semibold text-lg mb-2">Session Expired</h3>
            <p className="text-sm mb-4">Your session has expired. Redirecting to login page...</p>
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm hover:bg-amber-700 transition-colors"
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error && !sessionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
          title="All Time Deposited"
          value={formatINR(dashboardData.summary.totalDeposited)}
          subtext="Total amount invested"
          icon={Wallet}
        />

        {/* Total Gold Grams */}
        <StatCard
          title="Total Gold (g)"
          value={`${dashboardData.summary.totalGoldGrams.toFixed(2)} g`}
          subtext="Your gold holdings"
          icon={Coins}
        />

        {/* Current Gold Value */}
        <StatCard
          title="Current Gold Value"
          value={formatINR(dashboardData.summary.currentGoldValue)}
          subtext={`Rate: ₹${dashboardData.summary.currentGoldRate.toLocaleString()}/g`}
          icon={DollarSign}
          trend={dashboardData.summary.profitLossPercent}
        />

        {/* Profit/Loss */}
        <StatCard
          title="Profit / Loss"
          value={formatINR(Math.abs(dashboardData.summary.profitLoss))}
          subtext={dashboardData.summary.profitLoss >= 0 ? "Total profit" : "Total loss"}
          icon={dashboardData.summary.profitLoss >= 0 ? TrendingUp : TrendingDown}
          trend={dashboardData.summary.profitLossPercent}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-card rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg">{chartTitle}</h3>
          <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleChartPeriodChange("7days")}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-xs md:text-sm font-medium transition-all ${chartPeriod === "7days"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-input text-foreground hover:bg-muted"
                }`}
            >
              7 Days
            </button>
            <button
              onClick={() => handleChartPeriodChange("30days")}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-xs md:text-sm font-medium transition-all ${chartPeriod === "30days"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-input text-foreground hover:bg-muted"
                }`}
            >
              30 Days
            </button>
          </div>
        </div>
        <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full">
          {dashboardData.trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.trend}>
                <defs>
                  <linearGradient id="colorGoldValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7686 0.1647 70.0804)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.7686 0.1647 70.0804)" stopOpacity={0} />
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
                  // Show actual Rupee values from API (e.g. 83, 90) instead of compressing to \"₹0k\"
                  tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  tick={{ fontSize: 10 }}
                  className="text-[10px] sm:text-xs"
                  width={50}
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
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p className="text-sm">No trend data available</p>
            </div>
          )}
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
              <p className="text-sm sm:text-base md:text-lg font-bold text-foreground shrink-0 sm:ml-2">{formatINR(dashboardData.summary.totalDeposited)}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground">Current Value</p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Based on current gold rate</p>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-bold text-primary shrink-0 sm:ml-2">{formatINR(dashboardData.summary.currentGoldValue)}</p>
            </div>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 p-2.5 sm:p-3 md:p-4 rounded-lg border ${dashboardData.summary.profitLoss >= 0
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-destructive/10 border-destructive/20'
              }`}>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground">Net Gain / Loss</p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">Total return on investment</p>
              </div>
              <div className="text-left sm:text-right shrink-0 sm:ml-2">
                <p className={`text-sm sm:text-base md:text-lg font-bold flex items-center gap-1 ${dashboardData.summary.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'
                  }`}>
                  {dashboardData.summary.profitLoss >= 0 ? <TrendingUp size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" /> : <TrendingDown size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />}
                  {formatINR(dashboardData.summary.profitLoss)}
                </p>
                <p className={`text-[9px] sm:text-[10px] md:text-xs font-medium ${dashboardData.summary.profitLoss >= 0 ? 'text-green-600' : 'text-destructive'
                  }`}>
                  {dashboardData.summary.profitLoss >= 0 ? '+' : ''}{dashboardData.summary.profitLossPercent}%
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
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{dashboardData.summary.totalGoldGrams.toFixed(2)} g</p>
              </div>
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                <span>Current Rate</span>
                <span className="font-medium">₹{dashboardData.summary.currentGoldRate.toLocaleString()}/g</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1">Average Buy Rate</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-foreground wrap-break-word">₹{dashboardData.summary.averageBuyRate.toLocaleString()}/g</p>
              </div>
              <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1">Current Rate</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-foreground wrap-break-word">₹{dashboardData.summary.currentGoldRate.toLocaleString()}/g</p>
              </div>
            </div>
            <div className="p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground">Total Value</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-primary wrap-break-word">{formatINR(dashboardData.summary.currentGoldValue)}</p>
              </div>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                Calculated at current market rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="bg-card rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 md:p-6 shadow-sm">
        <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-6">Investment Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
          <div className="p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1">Total Investments</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{dashboardData.quickStats.totalInvestments}</p>
          </div>
          <div className="p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1">Total Withdrawals</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{dashboardData.quickStats.totalWithdrawals}</p>
          </div>
          <div className="p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1">Total Transactions</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{dashboardData.quickStats.totalTransactions}</p>
          </div>
          <div className="p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1">Avg. Monthly Investment</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{formatINR(dashboardData.quickStats.averageMonthlyInvestment)}</p>
          </div>
          <div className="p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1">Days Since Last Investment</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{dashboardData.quickStats.lastInvestmentDays}</p>
          </div>
          <div className="p-2.5 sm:p-3 md:p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1">Avg. Gold/Transaction</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{dashboardData.quickStats.goldPerTransaction.toFixed(2)} g</p>
          </div>
        </div>
      </div>

    </div>
  );
}