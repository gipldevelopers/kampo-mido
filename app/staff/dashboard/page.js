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
  ShieldAlert,
  ClipboardList
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
    <div className="mt-0.5 sm:mt-1">
      {loading ? (
        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
      ) : (
        subtext && (
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground leading-tight">{subtext}</p>
        )
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

export default function StaffDashboard() {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    todayRegistrations: 0,
    totalDeposits: 0,
    goldHeld: 0,
    goldRate: 0,
    pendingKyc: 0,
    pendingWithdrawals: 0
  });
  const [goldData, setGoldData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.getDashboardData();

      if (response?.data) {
        const { overview, charts, recentTransactions } = response.data;
        setStats(overview || {});
        setGoldData(charts?.goldRateTrend || []);
        setRecentTransactions(recentTransactions || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard content:', error);
      if (error.response?.status === 403) {
        setAuthError(true);
      }
      setToast({
        message: error.message || "Failed to load dashboard data",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-600 mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          You don't have the necessary permissions to view the staff dashboard.
        </p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-primary text-primary-foreground rounded-md">
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Staff Dashboard</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Overview of client management and platform activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/users/add"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium"
          >
            <UserPlus size={14} />
            <span>Add Customer</span>
          </Link>
          <Link
            href="/admin/deposits/add"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground border border-input rounded-md text-xs font-medium"
          >
            <PlusCircle size={14} />
            <span>Add Deposit</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          subtext={`+${stats.todayRegistrations} Today`}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Current Gold Rate"
          value={`₹${stats.goldRate?.toLocaleString()}/g`}
          subtext="Latest Market Price"
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          title="Pending KYC"
          value={stats.pendingKyc}
          subtext="Requires Verification"
          icon={ShieldAlert}
          loading={loading}
        />
        <StatCard
          title="Pending Withdrawals"
          value={stats.pendingWithdrawals}
          subtext="Awaiting Action"
          icon={Activity}
          loading={loading}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <ClipboardList size={18} className="text-primary" />
              Recent System Activity
            </h3>
            <button 
              onClick={fetchDashboardData}
              className="text-xs text-primary hover:underline font-medium"
            >
              Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
              </div>
            ) : recentTransactions.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left">Client Name</th>
                    <th className="px-4 py-3 font-medium text-left">Action</th>
                    <th className="px-4 py-3 font-medium text-left">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentTransactions.slice(0, 8).map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{tx.user}</td>
                      <td className="px-4 py-3 text-muted-foreground">{tx.type}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <Activity className="mx-auto w-12 h-12 opacity-20 mb-2" />
                <p>No recent activity found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Insights Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Gold Trend Card */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4">Gold Value Trend</h3>
            <div className="h-[200px] w-full">
              {goldData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={goldData}>
                    <defs>
                      <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="day" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#F59E0B" 
                      fillOpacity={1} 
                      fill="url(#colorGold)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                  Chart data unavailable
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2 italic">
              Last 30-day market valuation trend.
            </p>
          </div>

          {/* Platform Performance Insight */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Activity size={16} className="text-primary" />
              Quick Action Tips
            </h4>
            <div className="space-y-3">
              <div className="text-[11px] leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground mb-1">KYC Approvals:</p>
                Prioritize pending KYC requests to allow clients to start depositing within 24 hours of registration.
              </div>
              <div className="text-[11px] leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Manual Deposits:</p>
                Ensure UPI reference numbers are cross-verified with bank statements before final approval.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
