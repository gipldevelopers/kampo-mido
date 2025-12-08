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
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Statements</h2>
          <p className="text-sm text-muted-foreground">View and download your account statements.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          <button
            onClick={() => setStatementType("weekly")}
            className={`pb-3 text-sm font-medium transition-all relative ${
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
            className={`pb-3 text-sm font-medium transition-all relative ${
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
      <div className="min-h-[400px]">
        {/* Statements List */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {statementType === "weekly" ? "Weekly Statements" : "Monthly Statements"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter size={16} />
                <span>All Statements</span>
              </div>
            </div>
          </div>
        
        <div className="divide-y divide-border">
          {statements.length > 0 ? (
            statements.map((statement) => (
              <div key={statement.id} className="p-6 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{statement.period}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {statement.date}
                        </span>
                        <span>•</span>
                        <span>{statement.size}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(statement.id)}
                    disabled={loading === statement.id}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading === statement.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No statements available yet.</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Info Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm font-medium text-foreground mb-2">About Statements</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Weekly statements are generated every Monday</li>
          <li>Monthly statements are generated on the 1st of each month</li>
          <li>Statements include all transactions, deposits, withdrawals, and gold conversions</li>
          <li>Download statements in PDF format for your records</li>
        </ul>
      </div>

    </div>
  );
}

