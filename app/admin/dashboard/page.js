"use client";
import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Wallet,  
  FileCheck, 
  ArrowUpCircle,
  PlusCircle,
  RefreshCcw,
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
  BarChart,
  Bar
} from 'recharts';

// --- Mock Data ---

const goldData = [
  { day: '1', rate: 7200 }, { day: '5', rate: 7250 }, { day: '10', rate: 7180 },
  { day: '15', rate: 7300 }, { day: '20', rate: 7450 }, { day: '25', rate: 7600 },
  { day: '30', rate: 7645 },
];

const depositData = [
  { day: 'Mon', amount: 45000 }, { day: 'Tue', amount: 62000 },
  { day: 'Wed', amount: 28000 }, { day: 'Thu', amount: 95000 },
  { day: 'Fri', amount: 120000 }, { day: 'Sat', amount: 85000 },
  { day: 'Sun', amount: 30000 },
];

const recentTransactions = [
  { id: "TX-8812", user: "Rahul Sharma", amount: 25000, type: "Deposit", status: "Success", date: "Today, 10:20 AM" },
  { id: "TX-8813", user: "Priya Singh", amount: 12000, type: "Withdrawal", status: "Pending", date: "Today, 09:15 AM" },
  { id: "TX-8814", user: "Amit Kumar", amount: 50000, type: "Deposit", status: "Success", date: "Yesterday" },
  { id: "TX-8815", user: "Sneha Gupta", amount: 76450, type: "Gold Buy", status: "Failed", date: "Yesterday" },
  { id: "TX-8816", user: "Vikram M.", amount: 100000, type: "Deposit", status: "Success", date: "01 Dec" },
];

const recentActivity = [
  { id: 1, text: "Admin updated Gold Rate to ₹7,645", time: "2 hrs ago" },
  { id: 2, text: "New KYC uploaded by User #1245", time: "3 hrs ago" },
  { id: 3, text: "System backup completed successfully", time: "5 hrs ago" },
  { id: 4, text: "Suspicious login attempt blocked", time: "1 day ago" },
  { id: 5, text: "Weekly report generated", time: "1 day ago" },
];

// --- Reusable Components ---

const StatCard = ({ title, value, subtext, icon: Icon }) => (
  <div className="bg-card text-card-foreground p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground leading-tight">{title}</span>
      <div className="p-1 sm:p-1.5 md:p-2 bg-primary/10 rounded-md sm:rounded-lg shrink-0">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
      </div>
    </div>
    <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">{value}</div>
    {subtext && <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">{subtext}</p>}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Success: "text-primary bg-primary/10 border-primary/20",
    Pending: "text-muted-foreground bg-muted border-border",
    Failed: "text-destructive bg-destructive/10 border-destructive/20",
  };
  return (
    <span className={`px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  const [stats] = useState({
    totalCustomers: 1245,
    todayRegistrations: 12,
    totalDeposits: 12500000,
    goldHeld: 8450,
    goldRate: 7645,
    pendingKyc: 24,
    pendingWithdrawals: 18
  });

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-4 sm:pb-6 md:pb-8">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
           <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Overview</h2>
           <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Welcome to Kampo Mido Jewellers Admin Panel</p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-[10px] sm:text-xs md:text-sm font-medium hover:opacity-90 shadow-sm transition-all">
            <UserPlus size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 shrink-0" /> <span className="hidden sm:inline">Add Customer</span><span className="sm:hidden">Add</span>
          </button>
          <button className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-secondary text-secondary-foreground rounded-md text-[10px] sm:text-xs md:text-sm font-medium hover:opacity-90 shadow-sm transition-all">
            <PlusCircle size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 shrink-0" /> <span className="hidden sm:inline">Add Deposit</span><span className="sm:hidden">Deposit</span>
          </button>
          <button className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-[10px] sm:text-xs md:text-sm font-medium shadow-sm transition-all">
            <RefreshCcw size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 shrink-0" /> <span className="hidden sm:inline">Update Rate</span><span className="sm:hidden">Rate</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Stats Grid (Updated) - Mobile First: 2 columns on mobile, 4 on large screens */}
      <div className="grid gap-2.5 sm:gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers.toLocaleString()} 
          subtext={`+${stats.todayRegistrations} New Today`} 
          icon={Users} 
        />
        {/* Card 2 */}
        <StatCard 
          title="Total Deposits" 
          value={formatINR(stats.totalDeposits)}
          subtext="Total platform liquidity" 
          icon={Wallet} 
        />
        {/* Card 3 - Swapped in */}
        <StatCard 
          title="Pending KYC" 
          value={stats.pendingKyc} 
          subtext="Action required" 
          icon={FileCheck} 
        />
        {/* Card 4 - Swapped in */}
        <StatCard 
          title="Pending Withdrawals" 
          value={stats.pendingWithdrawals} 
          subtext="Review requests" 
          icon={ArrowUpCircle} 
        />
      </div>

      {/* 3. Charts Section */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Gold Rate Graph */}
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 md:p-6 shadow-sm">
          <h3 className="font-semibold mb-2 sm:mb-3 md:mb-4 lg:mb-6 text-xs sm:text-sm md:text-base lg:text-lg">Gold Value Trend (30 Days)</h3>
          <div className="h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={goldData}>
                <defs>
                  <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7686 0.1647 70.0804)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.7686 0.1647 70.0804)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="rate" stroke="oklch(0.7686 0.1647 70.0804)" strokeWidth={2} fillOpacity={1} fill="url(#colorGold)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deposits Graph */}
        <div className="bg-card rounded-lg sm:rounded-xl border border-border p-3 sm:p-4 md:p-6 shadow-sm">
          <h3 className="font-semibold mb-2 sm:mb-3 md:mb-4 lg:mb-6 text-xs sm:text-sm md:text-base lg:text-lg">Daily Deposits (Last 7 Days)</h3>
           <div className="h-[180px] sm:h-[220px] md:h-[250px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depositData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: 'var(--muted)'}}
                   contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" fill="oklch(0.7686 0.1647 70.0804)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Transactions + Activity */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        
        {/* Recent Transactions - Mobile Card View / Desktop Table View */}
        <div className="lg:col-span-2 bg-card rounded-lg sm:rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 sm:p-4 md:p-6 border-b border-border flex items-center justify-between">
             <h3 className="font-semibold text-sm sm:text-base md:text-lg">Recent Transactions</h3>
             <button className="text-[10px] sm:text-xs md:text-sm text-primary hover:underline">View All</button>
          </div>
          
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
                  <p className="font-semibold text-sm text-foreground">₹ {tx.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">User</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Type</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Amount</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium">{tx.user}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground">{tx.type}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">₹ {tx.amount.toLocaleString()}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4"><StatusBadge status={tx.status} /></td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-muted-foreground">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Recent Activity (Pending cards moved to top) */}
        <div className="space-y-3 sm:space-y-4">
           {/* Recent Activity Feed */}
           <div className="bg-card p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm h-full">
             <div className="flex items-center gap-2 mb-3 sm:mb-4">
               <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
               <h3 className="font-semibold text-xs sm:text-sm md:text-base">Recent Activity</h3>
             </div>
             <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
               {recentActivity.map((act) => (
                 <div key={act.id} className="flex gap-2 sm:gap-3 relative">
                   <div className="mt-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shrink-0" />
                   <div className="min-w-0 flex-1">
                     <p className="text-[10px] sm:text-xs md:text-sm font-medium leading-tight">{act.text}</p>
                     <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">{act.time}</p>
                   </div>
                 </div>
               ))}
             </div>
             <button className="w-full mt-3 sm:mt-4 md:mt-6 py-1.5 sm:py-2 text-[10px] sm:text-xs border border-border rounded-md text-muted-foreground hover:bg-muted transition-colors">
               View Full Log
             </button>
           </div>
        </div>

      </div>

    </div>
  );
}