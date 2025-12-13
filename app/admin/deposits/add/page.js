"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, ChevronDown, Calculator, Loader2 } from "lucide-react";
import Toast from "@/components/Toast";
import GoldRateService from "@/services/admin/gold-rate.service";
import CustomerService from "@/services/admin/customer.service";
import DepositService from "@/services/admin/deposit.service";

export default function AddDeposit() {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(true);
  const [fetchingCustomers, setFetchingCustomers] = useState(true);
  
  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState("");
  const [deposits, setDeposits] = useState([]);
  const [fetchingDeposits, setFetchingDeposits] = useState(false);
  const [amount, setAmount] = useState("");
  const [upiReference, setUpiReference] = useState("");
  const [depositDateTime, setDepositDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [adminNotes, setAdminNotes] = useState("");
  const [goldRate, setGoldRate] = useState(null);
  const [calculatedGold, setCalculatedGold] = useState(0);

  // Fetch current gold rate on mount
  useEffect(() => {
    const fetchGoldRate = async () => {
      setFetchingRate(true);
      try {
        const response = await GoldRateService.getCurrentRate();
        
        // Handle different response structures
        let rate = null;
        if (response.data) {
          rate = response.data.ratePerGram || response.data.rate;
        } else if (response.ratePerGram || response.rate) {
          rate = response.ratePerGram || response.rate;
        }
        
        if (rate) {
          setGoldRate(rate);
        } else {
          setToast({ message: "Failed to fetch gold rate", type: "error" });
        }
      } catch (error) {
        console.error("Error fetching gold rate:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch gold rate";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setFetchingRate(false);
      }
    };

    fetchGoldRate();
  }, []);

  // Fetch all customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setFetchingCustomers(true);
      try {
        const response = await CustomerService.getAllCustomers();
        
        // Handle different response structures
        let customersData = [];
        if (response.data && Array.isArray(response.data)) {
          customersData = response.data;
        } else if (Array.isArray(response)) {
          customersData = response;
        } else if (response.customers && Array.isArray(response.customers)) {
          customersData = response.customers;
        }
        
        // Format customers data
        const formattedCustomers = customersData.map((customer) => ({
          id: customer.id || customer.userId,
          name: customer.fullName || `${customer.user?.firstname || ''} ${customer.user?.lastname || ''}`.trim() || "N/A",
          accountNumber: customer.accountNumber || customer.customerCode || "N/A",
          displayName: `${customer.fullName || `${customer.user?.firstname || ''} ${customer.user?.lastname || ''}`.trim() || "N/A"} (${customer.accountNumber || customer.customerCode || "N/A"})`
        }));
        
        setCustomers(formattedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch customers";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setFetchingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch deposits when customer is selected
  useEffect(() => {
    const fetchDeposits = async () => {
      if (!selectedCustomer) {
        setDeposits([]);
        setSelectedDeposit("");
        return;
      }

      setFetchingDeposits(true);
      try {
        const response = await DepositService.getCustomerDeposits(selectedCustomer);
        
        // Handle different response structures
        let depositsData = [];
        if (response.data && Array.isArray(response.data)) {
          depositsData = response.data;
        } else if (Array.isArray(response)) {
          depositsData = response;
        } else if (response.deposits && Array.isArray(response.deposits)) {
          depositsData = response.deposits;
        }
        
        // Format deposits data - store full deposit object for auto-fill
        // Filter out converted and processing deposits (only show pending and approved)
        const formattedDeposits = depositsData
          .filter((deposit) => {
            // Exclude deposits that are already converted or being processed
            return !deposit.isConverted && 
                   deposit.status !== "converted" && 
                   deposit.status !== "Converted" &&
                   deposit.status !== "processing" &&
                   deposit.status !== "Processing";
          })
          .map((deposit) => {
            const depositDate = deposit.depositDate || deposit.date || deposit.createdAt;
            // Get all possible field names from the deposit object
            const upiRef = deposit.upiReference || deposit.upiRef || deposit.upiReferenceNumber || "";
            const adminNotes = deposit.notes || deposit.adminNotes || deposit.note || "";
            
            return {
              id: deposit.id || deposit.depositId,
              amount: deposit.amount || 0,
              date: depositDate
                ? new Date(depositDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : "N/A",
              status: deposit.status || "Pending",
              goldAmount: deposit.goldAmount || deposit.gold || 0,
              upiReference: upiRef,
              rawDate: depositDate, // Store raw date for datetime-local input
              notes: adminNotes,
              isConverted: deposit.isConverted || false,
              // Store full deposit object for auto-fill
              fullData: deposit,
              displayName: `₹ ${(deposit.amount || 0).toLocaleString()} - ${deposit.status || "Pending"} (${depositDate ? new Date(depositDate).toLocaleDateString('en-IN') : "N/A"})`
            };
          });
        
        setDeposits(formattedDeposits);
      } catch (error) {
        console.error("Error fetching deposits:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch deposits";
        setToast({ message: errorMessage, type: "error" });
        setDeposits([]);
      } finally {
        setFetchingDeposits(false);
      }
    };

    fetchDeposits();
  }, [selectedCustomer]);

  // Auto-fill all fields when deposit is selected
  useEffect(() => {
    if (selectedDeposit && deposits.length > 0) {
      // Convert both to string for comparison to handle type mismatches
      const deposit = deposits.find(d => String(d.id) === String(selectedDeposit));
      
      if (deposit) {
        console.log("Found deposit for auto-fill:", deposit);
        
        // Auto-fill amount - always set if deposit has amount
        if (deposit.amount !== undefined && deposit.amount !== null && deposit.amount !== 0) {
          setAmount(deposit.amount.toString());
        }
        
        // Auto-fill UPI reference (check both formatted and fullData)
        const upiRef = deposit.upiReference || deposit.fullData?.upiReference || deposit.fullData?.upiRef || "";
        setUpiReference(upiRef); // Set even if empty to clear previous value
        
        // Auto-fill date & time
        const dateValue = deposit.rawDate || deposit.fullData?.depositDate || deposit.fullData?.date || deposit.fullData?.createdAt;
        if (dateValue) {
          try {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
              // Format for datetime-local input (YYYY-MM-DDTHH:mm)
              const formattedDate = date.toISOString().slice(0, 16);
              setDepositDateTime(formattedDate);
            }
          } catch (error) {
            console.error("Error formatting date:", error, dateValue);
          }
        }
        
        // Auto-fill admin notes (check both formatted and fullData)
        const notes = deposit.notes || deposit.fullData?.notes || deposit.fullData?.adminNotes || "";
        setAdminNotes(notes); // Set even if empty to clear previous value
      } else {
        console.log("Deposit not found. Selected ID:", selectedDeposit, "Type:", typeof selectedDeposit);
        console.log("Available deposits:", deposits.map(d => ({ id: d.id, type: typeof d.id })));
      }
    }
  }, [selectedDeposit, deposits]);

  // Calculate gold when amount or rate changes
  useEffect(() => {
    if (amount && !isNaN(amount) && goldRate && goldRate > 0) {
      const gold = (parseFloat(amount) / goldRate).toFixed(4);
      setCalculatedGold(gold);
    } else {
      setCalculatedGold(0);
    }
  }, [amount, goldRate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setToast({ message: "Please select a customer", type: "error" });
      return;
    }
    if(!amount || amount <= 0) {
      setToast({ message: "Please enter a valid amount", type: "error" });
      return;
    }
    if (!selectedDeposit) {
      setToast({ message: "Please select a deposit to process", type: "error" });
      return;
    }
    
    setLoading(true);
    try {
      await DepositService.processDeposit(selectedDeposit, adminNotes || "");
      setToast({ message: "Deposit processed & Gold credited!", type: "success" });
      
      // Reset form after successful submission
      setSelectedDeposit("");
      setAmount("");
      setUpiReference("");
      setDepositDateTime(new Date().toISOString().slice(0, 16));
      setAdminNotes("");
      
      // Optionally refresh deposits list
      // You can uncomment this if you want to refresh the deposits dropdown
      // const response = await DepositService.getCustomerDeposits(selectedCustomer);
      // ... refresh deposits logic
    } catch (error) {
      console.error("Error processing deposit:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to process deposit";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full relative">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <Link href="/admin/deposits">
          <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Add New Deposit</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Manually record a UPI payment and convert to gold.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">Select Customer</label>
              <div className="relative">
                <select 
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  disabled={fetchingCustomers}
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {fetchingCustomers ? (
                    <option value="" disabled>Loading customers...</option>
                  ) : customers.length > 0 ? (
                    customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.displayName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No customers available</option>
                  )}
                </select>
                <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {fetchingCustomers ? (
                    <Loader2 size={14} className="sm:w-4 sm:h-4 text-muted-foreground animate-spin" />
                  ) : (
                    <ChevronDown size={14} className="sm:w-4 sm:h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {/* Deposits Dropdown */}
            {selectedCustomer && (
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Select Deposit (Optional)</label>
                <div className="relative">
                  <select 
                    value={selectedDeposit}
                    onChange={(e) => {
                      const depositId = e.target.value;
                      if (!depositId) {
                        setSelectedDeposit("");
                        return;
                      }
                      
                      // Check if selected deposit is converted or processing
                      const selectedDepositData = deposits.find(d => String(d.id) === String(depositId));
                      if (selectedDepositData && (
                        selectedDepositData.isConverted || 
                        selectedDepositData.status === "converted" || 
                        selectedDepositData.status === "Converted" ||
                        selectedDepositData.status === "processing" ||
                        selectedDepositData.status === "Processing"
                      )) {
                        setToast({ 
                          message: "Cannot select a deposit that has already been converted to gold or is being processed. Please select a pending or approved deposit.", 
                          type: "error" 
                        });
                        setSelectedDeposit("");
                        return;
                      }
                      
                      setSelectedDeposit(depositId);
                    }}
                    disabled={fetchingDeposits}
                    className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Choose Deposit (Optional) --</option>
                    {fetchingDeposits ? (
                      <option value="" disabled>Loading deposits...</option>
                    ) : deposits.length > 0 ? (
                      deposits.map((deposit) => (
                        <option key={deposit.id} value={deposit.id}>
                          {deposit.displayName}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No pending deposits found for this customer</option>
                    )}
                  </select>
                  <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {fetchingDeposits ? (
                      <Loader2 size={14} className="sm:w-4 sm:h-4 text-muted-foreground animate-spin" />
                    ) : (
                      <ChevronDown size={14} className="sm:w-4 sm:h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">Select a pending deposit to auto-fill all fields (converted deposits are excluded)</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Deposit Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                  placeholder="e.g. 50000" 
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Payment Mode</label>
                <input 
                  type="text" 
                  value="UPI" 
                  readOnly
                  className="w-full px-3 py-2 sm:py-2.5 bg-muted border border-input rounded-md text-sm text-muted-foreground cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">UPI Reference No.</label>
                <input 
                  type="text" 
                  value={upiReference}
                  onChange={(e) => setUpiReference(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                  placeholder="Txn ID from payment app" 
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={depositDateTime}
                  onChange={(e) => setDepositDateTime(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">Admin Notes</label>
              <textarea 
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y"
                placeholder="Optional notes..."
              ></textarea>
            </div>

            <div className="pt-2 sm:pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <Link href="/admin/deposits" className="w-full sm:w-auto">
                <button type="button" className="w-full sm:w-auto px-4 py-2 sm:py-2.5 border border-input bg-transparent rounded-md text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="sm:w-4 sm:h-4 shrink-0 animate-spin" /> <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Process Deposit</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right: Live Calculation Preview */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <Calculator size={16} className="sm:w-[18px] sm:h-[18px] text-primary shrink-0" /> <span>Conversion Preview</span>
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-muted-foreground">Current Gold Rate:</span>
                {fetchingRate ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Loading...</span>
                  </div>
                ) : goldRate ? (
                  <span className="font-medium text-foreground break-words">₹ {goldRate.toLocaleString()} /g</span>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
              
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-muted-foreground">Deposit Amount:</span>
                <span className="font-medium text-foreground break-words">₹ {amount || 0}</span>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-primary/20">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-1">Estimated Gold Credit</p>
                {fetchingRate || !goldRate ? (
                  <p className="text-sm text-muted-foreground">Enter amount to calculate</p>
                ) : (
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary break-words">{calculatedGold} g</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-xs sm:text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Important Note:</p>
            <p className="break-words">Ensure the UPI transaction is verified in your banking app before proceeding. This action will immediately credit the customer&apos;s wallet.</p>
          </div>
        </div>

      </div>
    </div>
  );
}