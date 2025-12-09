"use client";
import { useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Wallet, 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Download,
  AlertTriangle,
  Mail,
  Edit,
  Plus,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react";
import Toast from "@/components/Toast";

// --- Mock Data for Detail Page ---
const customerData = {
  id: 1,
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  phone: "+91 98765 43210",
  address: "B-404, Sterling City, Bopal, Ahmedabad, Gujarat - 380058",
  accountNo: "KM-1001",
  doj: "12 Aug, 2024",
  nominee: "Anjali Sharma (Wife)",
  kyc: {
    status: "Verified", // Verified, Pending, Rejected
    docType: "Aadhaar Card",
    docNumber: "XXXX-XXXX-1234",
    docUrl: "#" // Link to dummy PDF
  },
  wallet: {
    totalDeposited: 125000,
    currentGold: 12.5, // grams
    currentValue: 95562, // Current market value of gold held
    profit: -29438 // Loss in this mock scenario
  },
  ledger: [
    { id: "TX-101", date: "02 Dec 2024", type: "Deposit", amount: 25000, goldRate: 7600, grams: 3.28, status: "Success" },
    { id: "TX-102", date: "15 Nov 2024", type: "Deposit", amount: 50000, goldRate: 7550, grams: 6.62, status: "Success" },
    { id: "TX-103", date: "01 Nov 2024", type: "Deposit", amount: 50000, goldRate: 7500, grams: 2.60, status: "Success" }, // Conversion example
  ]
};

export default function CustomerDetail({ params }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("overview"); // overview, wallet, ledger
  const [toast, setToast] = useState(null);
  const [isSuspicious, setIsSuspicious] = useState(false);

  // Handlers
  const handleAction = (action) => {
    if (action === "deposit") setToast({ message: "Deposit module opening...", type: "success" });
    if (action === "message") setToast({ message: "Message sent to customer!", type: "success" });
    if (action === "suspicious") {
      setIsSuspicious(!isSuspicious);
      setToast({ message: isSuspicious ? "Customer marked as Safe" : "Customer marked as Suspicious", type: isSuspicious ? "success" : "alert" });
    }
    if (action === "approve_kyc") setToast({ message: "KYC Approved Successfully", type: "success" });
    if (action === "reject_kyc") setToast({ message: "KYC Rejected", type: "alert" });
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative pb-4 sm:pb-6 md:pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* 1. Top Header & Actions */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link href="/admin/customers">
            <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
            </button>
          </Link>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="truncate">{customerData.name}</span>
              {isSuspicious && <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] sm:text-xs font-medium border border-destructive/20 shrink-0">Suspicious</span>}
            </h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">ID: {customerData.accountNo} • Joined {customerData.doj}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleAction('deposit')} className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 shadow-sm transition-all">
            <Plus size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Add Deposit</span>
          </button>
          <Link href={`/admin/customers/edit/${id}`}>
            <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm font-medium hover:bg-muted transition-colors">
              <Edit size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Edit</span>
            </button>
          </Link>
          <button onClick={() => handleAction('message')} className="p-1.5 sm:p-2 bg-background border border-input rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
            <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button onClick={() => handleAction('suspicious')} className={`p-1.5 sm:p-2 border rounded-md transition-colors ${isSuspicious ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-background border-input text-muted-foreground hover:text-destructive'}`}>
            <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* 2. Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
          {['overview', 'wallet', 'ledger'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 3. Tab Content */}
      <div className="min-h-[300px] sm:min-h-[400px]">
        
        {/* --- Tab A: Profile Overview --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 animate-in slide-in-from-bottom-2 duration-300">
            {/* Personal Info */}
            <div className="md:col-span-2 bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm space-y-4 sm:space-y-5 md:space-y-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg border-b border-border pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-6 md:gap-x-8 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Full Name</p>
                  <p className="font-medium text-foreground break-words">{customerData.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Mobile Number</p>
                  <p className="font-medium text-foreground break-words">{customerData.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Email Address</p>
                  <p className="font-medium text-foreground break-words">{customerData.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Nominee</p>
                  <p className="font-medium text-foreground break-words">{customerData.nominee}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground mb-1 text-[10px] sm:text-xs">Residential Address</p>
                  <p className="font-medium text-foreground break-words">{customerData.address}</p>
                </div>
              </div>
            </div>

            {/* KYC Section */}
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm space-y-4 sm:space-y-5 md:space-y-6 h-fit">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg">KYC Details</h3>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium border ${
                  customerData.kyc.status === 'Verified' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-secondary-foreground border-border'
                }`}>
                  {customerData.kyc.status}
                </span>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-md border border-border">
                  <FileText size={16} className="sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs sm:text-sm font-medium truncate">{customerData.kyc.docType}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{customerData.kyc.docNumber}</p>
                  </div>
                  <button className="p-1 sm:p-1.5 hover:bg-background rounded text-primary transition-colors shrink-0">
                    <Download size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
                  <button onClick={() => handleAction('approve_kyc')} className="flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-md text-xs sm:text-sm font-medium transition-colors">
                    <CheckCircle2 size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">Approve</span><span className="sm:hidden">App</span>
                  </button>
                  <button onClick={() => handleAction('reject_kyc')} className="flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 rounded-md text-xs sm:text-sm font-medium transition-colors">
                    <XCircle size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">Reject</span><span className="sm:hidden">Rej</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab B: Wallet Summary --- */}
        {activeTab === 'wallet' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-card p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 sm:p-2 bg-secondary rounded-lg"><Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-foreground" /></div>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Total Deposited</p>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-1 break-words">₹ {customerData.wallet.totalDeposited.toLocaleString()}</h3>
            </div>

            <div className="bg-card p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg"><Coins className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /></div>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Total Gold</p>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-1">{customerData.wallet.currentGold} g</h3>
            </div>

            <div className="bg-card p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" /></div>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Current Value</p>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-1 break-words">₹ {customerData.wallet.currentValue.toLocaleString()}</h3>
            </div>

            <div className="bg-card p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 sm:p-2 bg-destructive/10 rounded-lg"><TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" /></div>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Profit / Loss</p>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-1 text-destructive break-words">
                {customerData.wallet.profit.toLocaleString()}
              </h3>
            </div>
          </div>
        )}

        {/* --- Tab C: Ledger History --- */}
        {activeTab === 'ledger' && (
          <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {customerData.ledger.map((tx) => (
                <div key={tx.id} className="p-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{tx.id}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{tx.date}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-medium shrink-0">
                      {tx.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Type</p>
                      <p className="text-xs text-foreground">{tx.type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Rate/g</p>
                      <p className="text-xs text-foreground">₹ {tx.goldRate}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Amount</p>
                      <p className="text-sm font-semibold text-foreground">₹ {tx.amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Gold</p>
                      <p className="text-sm font-medium text-primary">{tx.grams} g</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Date</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Transaction ID</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Type</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Amount</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Rate/g</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium">Gold Credited</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customerData.ledger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">{tx.date}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium">{tx.id}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">{tx.type}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold">₹ {tx.amount.toLocaleString()}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground">₹ {tx.goldRate}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-primary font-medium">{tx.grams} g</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}