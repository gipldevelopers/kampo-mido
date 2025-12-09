"use client";
import { useState } from "react";
import { 
  FileText, 
  Download,
  Calendar,
  Filter,
  ChevronDown
} from "lucide-react";
import Toast from "@/components/Toast";

// --- Mock Data ---
const weeklyStatements = [
  { id: "ST-W-001", period: "Week 48 (25 Nov - 01 Dec)", date: "01 Dec, 09:00 AM", type: "Weekly", size: "1.2 MB" },
  { id: "ST-W-002", period: "Week 47 (18 Nov - 24 Nov)", date: "24 Nov, 09:00 AM", type: "Weekly", size: "1.1 MB" },
  { id: "ST-W-003", period: "Week 46 (11 Nov - 17 Nov)", date: "17 Nov, 09:00 AM", type: "Weekly", size: "1.0 MB" },
];

const monthlyStatements = [
  { id: "ST-M-001", period: "November 2024", date: "01 Dec, 09:00 AM", type: "Monthly", size: "2.8 MB" },
  { id: "ST-M-002", period: "October 2024", date: "01 Nov, 09:00 AM", type: "Monthly", size: "2.5 MB" },
  { id: "ST-M-003", period: "September 2024", date: "01 Oct, 09:00 AM", type: "Monthly", size: "2.3 MB" },
];

export default function StatementsPage() {
  const [toast, setToast] = useState(null);
  const [statementType, setStatementType] = useState("weekly"); // 'weekly' or 'monthly'
  const [loading, setLoading] = useState(null);

  const statements = statementType === "weekly" ? weeklyStatements : monthlyStatements;

  const handleDownload = (id) => {
    setLoading(id);
    setTimeout(() => {
      setLoading(null);
      setToast({ message: "Statement downloaded successfully!", type: "success" });
    }, 1500);
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Statements</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">View and download your account statements.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-3 sm:gap-4 md:gap-6">
          <button
            onClick={() => setStatementType("weekly")}
            className={`pb-2 sm:pb-3 text-[11px] sm:text-xs md:text-sm font-medium transition-all relative ${
              statementType === "weekly" 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Weekly Statements
            {statementType === "weekly" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button
            onClick={() => setStatementType("monthly")}
            className={`pb-2 sm:pb-3 text-[11px] sm:text-xs md:text-sm font-medium transition-all relative ${
              statementType === "monthly" 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly Statements
            {statementType === "monthly" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px] sm:min-h-[400px]">
        {/* Statements List */}
        <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 md:p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg">
                {statementType === "weekly" ? "Weekly Statements" : "Monthly Statements"}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                <Filter size={12} className="sm:w-4 sm:h-4" />
                <span>All Statements</span>
              </div>
            </div>
          </div>
        
        <div className="divide-y divide-border">
          {statements.length > 0 ? (
            statements.map((statement) => (
              <div key={statement.id} className="p-3 sm:p-4 md:p-6 hover:bg-muted/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="p-2 sm:p-2.5 md:p-3 bg-primary/10 rounded-lg shrink-0">
                      <FileText size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[11px] sm:text-xs md:text-sm text-foreground mb-1 truncate">{statement.period}</h4>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <Calendar size={10} className="sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
                          {statement.date}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{statement.size}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(statement.id)}
                    disabled={loading === statement.id}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-[10px] sm:text-xs md:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
                  >
                    {loading === statement.id ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download size={12} className="sm:w-4 sm:h-4" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <FileText size={36} className="sm:w-12 sm:h-12 md:w-12 md:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">No statements available yet.</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Info Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-1.5 sm:mb-2">About Statements</p>
        <ul className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground space-y-0.5 sm:space-y-1 list-disc list-inside">
          <li>Weekly statements are generated every Monday</li>
          <li>Monthly statements are generated on the 1st of each month</li>
          <li>Statements include all transactions, deposits, withdrawals, and gold conversions</li>
          <li>Download statements in PDF format for your records</li>
        </ul>
      </div>

    </div>
  );
}

