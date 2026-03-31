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
  ShieldCheck
} from "lucide-react";
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

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Activity size={18} className="text-primary" /> My Recent Activity
          </h3>
          <button 
            onClick={fetchDashboardData}
            className="text-xs text-primary hover:underline hover:text-primary/80"
          >
            Refresh
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={activity.id || idx} className="flex gap-4 items-start">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{activity.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(activity.time).toLocaleDateString()} at {formatActivityTime(activity.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No recent activity recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
