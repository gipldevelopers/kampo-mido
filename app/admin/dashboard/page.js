"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Wallet,
  PlusCircle,
  Activity,
  Loader2,
  TrendingUp,
  AlertCircle,
  ShieldAlert
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import Toast from "@/components/Toast";
import DashboardService from "../../../services/admin/dashboard.service";

// Reusable Components
const StatCard = ({ title, value, subtext, icon: Icon, trend = null, loading = false }) => (
  <div className="bg-card text-card-foreground p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground leading-tight">{title}</span>
      <div className="p-1 sm:p-1.5 md:p-2 bg-primary/10 rounded-md sm:rounded-lg shrink-0">
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary animate-spin" />
        ) : (
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
        )}
      </div>
    </div>
    <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
      {loading ? (
        <div className="h-6 sm:h-7 md:h-8 bg-muted rounded animate-pulse"></div>
      ) : (
        value
      )}
    </div>
    <div className="flex items-center justify-between mt-0.5 sm:mt-1">
      {loading ? (
        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
      ) : (
        <>
          {subtext && (
            <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground leading-tight">{subtext}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-0.5 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp size={10} className={trend > 0 ? '' : 'rotate-180'} />
              <span className="text-[9px] sm:text-[10px] font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Success: "text-green-600 bg-green-50 border-green-200",
    Pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
    Failed: "text-red-600 bg-red-50 border-red-200",
    Approved: "text-blue-600 bg-blue-50 border-blue-200",
    Rejected: "text-red-600 bg-red-50 border-red-200",
    Completed: "text-green-600 bg-green-50 border-green-200"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium border ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

const ChartSkeleton = () => (
  <div className="h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] w-full bg-muted rounded animate-pulse"></div>
);

const ActivitySkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-3">
        <div className="mt-1.5 w-2 h-2 rounded-full bg-muted"></div>
        <div className="flex-1">
          <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
          <div className="h-2 bg-muted rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState({
    overall: true,
    stats: true,
    charts: true,
    transactions: true,
    activity: true
  });
  const [stats, setStats] = useState({
    totalCustomers: 0,
    todayRegistrations: 0,
    totalDeposits: 0,
    goldHeld: 0,
    goldRate: 0,
    pendingKyc: 0,
    pendingWithdrawals: 0,
    goldValue: 0,
    totalGrams: 0
  });
  const [goldData, setGoldData] = useState([]);
  const [depositData, setDepositData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trends, setTrends] = useState({
    customerGrowth: 0,
    depositGrowth: 0,
    goldGrowth: 0
  });

  // Format currency
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format grams
  const formatGrams = (grams) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(grams);
  };

  // Handle authentication error
  const handleAuthError = (error) => {
    const errorMessage = error.message || error.response?.data?.message || 'Access denied';

    if (error.response?.status === 403) {
      setAuthError(true);
      setToast({
        message: "Access denied. Please check if you have admin permissions or try logging in again.",
        type: "error"
      });

      // You can redirect to login page if needed
      // setTimeout(() => {
      //   router.push('/admin/login');
      // }, 3000);
    } else {
      setToast({
        message: errorMessage,
        type: "error"
      });
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading({
        overall: true,
        stats: true,
        charts: true,
        transactions: true,
        activity: true
      });
      setAuthError(false);

      // Use the main endpoint that returns all data at once
      try {
        const dashboardData = await DashboardService.getDashboardData();

        if (dashboardData?.data) {
          const { overview, charts, recentTransactions, recentActivity } = dashboardData.data;

          // Process stats
          setStats(overview || {});

          // Calculate trends (mock data for now)
          const mockTrends = {
            customerGrowth: 12.5,
            depositGrowth: 8.3,
            goldGrowth: 5.7
          };
          setTrends(mockTrends);

          // Process chart data
          if (charts) {
            setGoldData(charts.goldRateTrend || []);
            setDepositData(charts.dailyDeposits || []);
          }

          // Process transactions
          setRecentTransactions(recentTransactions || []);

          // Process activity
          setRecentActivity(recentActivity || []);
        }
      } catch (error) {
        handleAuthError(error);
        throw error;
      }

      // Update overall loading
      setTimeout(() => {
        setLoading(prev => ({ ...prev, overall: false, stats: false, charts: false, transactions: false, activity: false }));
      }, 500);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);

      // Set loading to false on error
      setLoading({
        overall: false,
        stats: false,
        charts: false,
        transactions: false,
        activity: false
      });
    }
  };

  const refreshCharts = async () => {
    try {
      setLoading(prev => ({ ...prev, charts: true }));
      const response = await DashboardService.getChartData('goldRate');
      if (response?.data) {
        setGoldData(response.data);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(prev => ({ ...prev, charts: false }));
    }
  };

  const refreshTransactions = async () => {
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      const response = await DashboardService.getRecentTransactions();
      if (response?.data) {
        setRecentTransactions(response.data);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  const refreshActivity = async () => {
    try {
      setLoading(prev => ({ ...prev, activity: true }));
      const response = await DashboardService.getRecentActivity();
      if (response?.data) {
        setRecentActivity(response.data);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(prev => ({ ...prev, activity: false }));
    }
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label, currency = false }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-xs font-semibold text-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs text-muted-foreground mt-1">
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {currency ? formatINR(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // If authentication error, show a different UI
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 md:p-12 max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard.
            Please check if you have admin privileges or contact your system administrator.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Go to Login
            </button>
            <button
              onClick={fetchDashboardData}
              className="w-full px-4 py-2 border border-input bg-background hover:bg-accent rounded-md font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-4 sm:pb-6 md:pb-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
            Welcome to Kampo Mido Jewellers Admin Panel
            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            href="/admin/users/add"
            className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-[10px] sm:text-xs md:text-sm font-medium hover:opacity-90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 shrink-0" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Link>
          <Link
            href="/admin/deposits/add"
            className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-secondary text-secondary-foreground rounded-md text-[10px] sm:text-xs md:text-sm font-medium hover:opacity-90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 shrink-0" />
            <span className="hidden sm:inline">Add Deposit</span>
            <span className="sm:hidden">Deposit</span>
          </Link>
          <Link
            href="/admin/gold-rate"
            className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-[10px] sm:text-xs md:text-sm font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 shrink-0" />
            <span className="hidden sm:inline">Update Rate</span>
            <span className="sm:hidden">Rate</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          subtext={`+${stats.todayRegistrations} Today`}
          trend={trends.customerGrowth}
          icon={Users}
          loading={loading.stats}
        />
        <StatCard
          title="Total Deposits"
          value={formatINR(stats.totalDeposits)}
          subtext="Platform Liquidity"
          trend={trends.depositGrowth}
          icon={Wallet}
          loading={loading.stats}
        />
        <StatCard
          title="Gold Holdings"
          value={`${formatGrams(stats.goldHeld)} g`}
          subtext={`${formatINR(stats.goldValue)} Value`}
          trend={trends.goldGrowth}
          icon={TrendingUp}
          loading={loading.stats}
        />
        <StatCard
          title="Current Gold Rate"
          value={`₹${stats.goldRate?.toLocaleString() || '0'}/g`}
          subtext="Latest market rate"
          icon={TrendingUp}
          loading={loading.stats}
        />
      </div>


      {/* Charts Section */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Gold Rate Chart */}
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 lg:mb-6">
            <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg">Gold Value Trend (30 Days)</h3>
            <button
              onClick={refreshCharts}
              disabled={loading.charts}
              className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1"
            >
              {loading.charts ? (
                <>
                  <Loader2 size={10} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Refresh'
              )}
            </button>
          </div>
          <div className="h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] w-full">
            {loading.charts ? (
              <ChartSkeleton />
            ) : goldData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={goldData}>
                  <defs>
                    <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="day"
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    fontSize={10}
                  />
                  <Tooltip content={<CustomTooltip currency={true} />} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGold)"
                    name="Rate per Gram"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No gold rate data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Deposits Chart */}
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 lg:mb-6">
            <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg">Daily Deposits (Last 7 Days)</h3>
            <button
              onClick={refreshCharts}
              disabled={loading.charts}
              className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1"
            >
              {loading.charts ? (
                <>
                  <Loader2 size={10} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Refresh'
              )}
            </button>
          </div>
          <div className="h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] w-full">
            {loading.charts ? (
              <ChartSkeleton />
            ) : depositData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depositData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="day"
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    fontSize={10}
                  />
                  <Tooltip content={<CustomTooltip currency={true} />} />
                  <Bar
                    dataKey="amount"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    name="Deposit Amount"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Wallet className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No deposit data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Transactions + Activity */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-card rounded-lg sm:rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 sm:p-4 md:p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg">Recent Transactions</h3>
              {loading.transactions && (
                <Loader2 size={14} className="animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshTransactions}
                disabled={loading.transactions}
                className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1"
              >
                {loading.transactions ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link
                href="/admin/transactions"
                className="text-[10px] sm:text-xs text-primary hover:underline"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {loading.transactions ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-32"></div>
                      <div className="h-2 bg-muted rounded w-24"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="h-2 bg-muted rounded w-16 ml-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-border">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="p-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs text-foreground truncate">{tx.user}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{tx.type}</p>
                        </div>
                        <StatusBadge status={tx.status} />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground">
                          {tx.amount ? `₹ ${tx.amount.toLocaleString()}` : 'N/A'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                      <tr>
                        <th className="px-6 py-3 font-medium text-left">User</th>
                        <th className="px-6 py-3 font-medium text-left">Type</th>
                        <th className="px-6 py-3 font-medium text-left">Amount</th>
                        <th className="px-6 py-3 font-medium text-left">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-medium">{tx.user}</td>
                          <td className="px-6 py-4 text-muted-foreground">{tx.type}</td>
                          <td className="px-6 py-4 font-semibold">
                            {tx.amount ? `₹ ${tx.amount.toLocaleString()}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4"><StatusBadge status={tx.status} /></td>
                          <td className="px-6 py-4 text-right text-muted-foreground">{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No recent transactions</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-2">Platform Health</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Active Customers</span>
                <span className="font-semibold text-xs sm:text-sm">{Math.round(stats.totalCustomers * 0.85).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Avg. Deposit</span>
                <span className="font-semibold text-xs sm:text-sm">{formatINR(stats.totalDeposits / Math.max(stats.totalCustomers, 1))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Gold Rate Change</span>
                <span className="font-semibold text-xs sm:text-sm text-green-600">+2.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}