"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Wallet,
  PlusCircle,
  Activity,
  Loader2,
  CheckCircle,
  Clock,
  ShieldCheck,
  TrendingUp
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
import StaffDashboardService from "@/services/staff/dashboard.service";

// Reusable Components
const StatCard = ({ title, value, subtext, icon: Icon, loading = false, color = "primary" }) => {
  const colorStyles = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-card text-card-foreground p-4 sm:p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</span>
        <div className={`p-2 rounded-lg shrink-0 ${colorStyles[color] || colorStyles.primary}`}>
          {loading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
      </div>
      <div className="text-xl sm:text-2xl font-bold">
        {loading ? (
          <div className="h-8 bg-muted rounded animate-pulse w-24"></div>
        ) : (
          value
        )}
      </div>
      {subtext && (
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  );
};

const ChartSkeleton = () => (
  <div className="h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] w-full bg-muted rounded animate-pulse"></div>
);

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label, formatINR }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-muted-foreground mt-1">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {formatINR(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalDeposits: 0,
    pendingKYC: 0,
    doneKYC: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [goldData, setGoldData] = useState([]);

  // Format currency
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await StaffDashboardService.getDashboardData();
      if (response?.success) {
        setStats(response.data.overview);
        setRecentActivity(response.data.recentActivity || []);
        setGoldData(response.data.goldRateTrend || []);
      }
    } catch (error) {
      setToast({
        message: error.message || "Failed to load dashboard data",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatActivityTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="text-primary" /> Staff Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tracking your customer additions and growth activities.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/staff/customers/add"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <UserPlus size={16} /> Add Customer
          </Link>
          <Link
            href="/staff/deposits/add"
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <PlusCircle size={16} /> Add Deposit
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          subtext="Added since joining"
          icon={Users}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Customer Deposits"
          value={formatINR(stats.totalDeposits)}
          subtext="Total amount deposited"
          icon={Wallet}
          color="green"
          loading={loading}
        />
        <StatCard
          title="KYC Pending"
          value={stats.pendingKYC.toLocaleString()}
          subtext="Customers awaiting verification"
          icon={Clock}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="KYC Verified"
          value={stats.doneKYC.toLocaleString()}
          subtext="Successfully verified today"
          icon={CheckCircle}
          color="green"
          loading={loading}
        />
      </div>

      {/* Gold Rate Chart */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Gold Value Trend (30 Days)
          </h3>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : 'Refresh'}
          </button>
        </div>
        <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full">
          {loading ? (
            <ChartSkeleton />
          ) : goldData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={goldData}>
                <defs>
                  <linearGradient id="colorGoldStaff" x1="0" y1="0" x2="0" y2="1">
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
                <Tooltip content={<CustomTooltip formatINR={formatINR} />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGoldStaff)"
                  name="Rate per Gram"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <TrendingUp className="w-12 h-12 text-muted-foreground mb-2 opacity-20" />
              <p className="text-sm text-muted-foreground">No gold rate data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
