"use client";
import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Wallet, 
  TrendingUp, 
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
  <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
    <div className="text-2xl font-bold">{value}</div>
    {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Success: "text-primary bg-primary/10 border-primary/20",
    Pending: "text-muted-foreground bg-muted border-border",
    Failed: "text-destructive bg-destructive/10 border-destructive/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.Pending}`}>
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
           <p className="text-muted-foreground">Welcome to Kampo Mido Jewellers Admin Panel</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 shadow-sm transition-all">
            <UserPlus size={16} /> Add Customer
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:opacity-90 shadow-sm transition-all">
            <PlusCircle size={16} /> Add Deposit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium shadow-sm transition-all">
            <RefreshCcw size={16} /> Update Rate
          </button>
        </div>
      </div>

      {/* 2. Primary Stats Grid (Updated) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gold Rate Graph */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold mb-6 text-lg">Gold Value Trend (30 Days)</h3>
          <div className="h-[300px] w-full">
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
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold mb-6 text-lg">Daily Deposits (Last 7 Days)</h3>
           <div className="h-[300px] w-full">
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
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Recent Transactions Table (Takes up 2/3 width) */}
        <div className="md:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
             <h3 className="font-semibold text-lg">Recent Transactions</h3>
             <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{tx.user}</td>
                    <td className="px-6 py-4 text-muted-foreground">{tx.type}</td>
                    <td className="px-6 py-4 font-semibold">₹ {tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={tx.status} /></td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Recent Activity (Pending cards moved to top) */}
        <div className="space-y-4">
           {/* Recent Activity Feed */}
           <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-full">
             <div className="flex items-center gap-2 mb-4">
               <Activity className="w-4 h-4 text-muted-foreground" />
               <h3 className="font-semibold">Recent Activity</h3>
             </div>
             <div className="space-y-4">
               {recentActivity.map((act) => (
                 <div key={act.id} className="flex gap-3 relative">
                   <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                   <div>
                     <p className="text-sm font-medium leading-none">{act.text}</p>
                     <p className="text-xs text-muted-foreground mt-1">{act.time}</p>
                   </div>
                 </div>
               ))}
             </div>
             <button className="w-full mt-6 py-2 text-xs border border-border rounded-md text-muted-foreground hover:bg-muted transition-colors">
               View Full Log
             </button>
           </div>
        </div>

      </div>

    </div>
  );
}