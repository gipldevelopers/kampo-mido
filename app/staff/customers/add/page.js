"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Search, X } from "lucide-react";
import UserService from "@/services/admin/user.service";
import CustomerService from "@/services/admin/customer.service";
import Toast from "@/components/Toast";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Premium Date of Birth Picker Component
 * Provides a Year-first selection flow for fast access to birth years.
 */
function PremiumDobPicker({ value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("year"); // year, month, day
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null); // 0-based

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 110 }, (_, i) => currentYear - i);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const handleOpen = () => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedYear(d.getFullYear());
        setSelectedMonth(d.getMonth());
      }
    }
    setView("year");
    setIsOpen(true);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setView("month");
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
    setView("day");
  };

  const handleDaySelect = (day) => {
    const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const formatDisplayDate = (val) => {
    if (!val) return "Select Date";
    const [y, m, d] = val.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground transition-all hover:border-primary/50 ${
          error ? "border-destructive ring-1 ring-destructive/20" : "border-input"
        }`}
      >
        <span className={!value ? "text-muted-foreground" : ""}>
          {formatDisplayDate(value)}
        </span>
        <CalendarIcon size={16} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[340px] z-[70] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                {view === "year" ? "Select Year" : view === "month" ? `Select Month (${selectedYear})` : `Select Day (${months[selectedMonth]} ${selectedYear})`}
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
              {view === "year" && (
                <div className="grid grid-cols-4 gap-2">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={`py-2 text-sm rounded-lg transition-all ${
                        selectedYear === year ? "bg-primary text-primary-foreground font-bold" : "hover:bg-primary/10 text-foreground"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}

              {view === "month" && (
                <div className="grid grid-cols-3 gap-3">
                  {months.map((month, idx) => (
                    <button
                      key={month}
                      onClick={() => handleMonthSelect(idx)}
                      className={`py-4 text-sm rounded-xl border transition-all ${
                        selectedMonth === idx ? "bg-primary text-primary-foreground border-primary font-bold shadow-lg" : "bg-muted/30 hover:bg-muted border-border text-foreground"
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}

              {view === "day" && (
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => handleDaySelect(day)}
                      className="aspect-square flex items-center justify-center text-sm rounded-lg hover:bg-primary/20 text-foreground transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-primary/30"
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {(view === "month" || view === "day") && (
              <div className="p-3 border-t border-border flex justify-start">
                <button
                  type="button"
                  onClick={() => setView(view === "day" ? "month" : "year")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Back to {view === "day" ? "Month" : "Year"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AddCustomer() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    whatsapp: "",
    email: "",
    address: "",
    gender: "",
    dob: "",
    city: "",
    state: "",
    pincode: "",
    capLockYears: "0",
    initialDeposit: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // User search dropdown states
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await UserService.getAllUsers();

        // Handle different response structures
        let usersList = [];
        if (response.data && Array.isArray(response.data)) {
          usersList = response.data;
        } else if (response.data && response.data.users) {
          usersList = response.data.users;
        } else if (response.users) {
          usersList = response.users;
        }

        setUsers(usersList);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format user name
  const getUserName = (user) => {
    if (user.name) return user.name;
    if (user.firstname || user.lastname) {
      return `${user.firstname || ""} ${user.lastname || ""}`.trim();
    }
    return "N/A";
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const name = getUserName(user).toLowerCase();
    const email = (user.email || "").toLowerCase();
    const phone = (user.phone || user.mobile || "").toLowerCase();

    return name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm.toLowerCase());
  });

  // Handle user selection
  const handleUserSelect = async (user) => {
    const fullName = getUserName(user);
    setFormData(prev => ({
      ...prev,
      fullName: fullName,
      mobile: user.phone || user.mobile || "",
      email: user.email || "",
      address: user.address || "",
    }));
    setSelectedUserId(user.id);
    setSearchTerm("");
    setShowDropdown(false);

    // Check if this user already has a customer record
    try {
      const customersResponse = await CustomerService.getAllCustomers();
      const customers = customersResponse.data || [];
      const existingCustomer = customers.find(c => c.userId === user.id);
      if (existingCustomer) {
        setSelectedCustomerId(existingCustomer.id);
      }
    } catch (error) {
      console.error("Failed to check existing customer:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid phone number";
    }

    // WhatsApp number required
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "WhatsApp number is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Gender required
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Date of Birth required and cannot be future
    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required";
    } else {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      // Reset time for accurate date comparison
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        newErrors.dob = "Date of Birth cannot be in the future";
      }
    }

    // City, State, Pincode required
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ message: "Please fill in all required fields correctly", type: "error" });
      return;
    }

    // Check if we have a customer ID (from selected user) or need to create one
    if (!selectedCustomerId && !selectedUserId) {
      setToast({ message: "Please select a user from the search dropdown", type: "error" });
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      // If we don't have a customer ID yet, try to find it or use userId as customerId
      let customerId = selectedCustomerId;

      if (!customerId) {
        // Try to find customer by userId
        try {
          const customersResponse = await CustomerService.getAllCustomers();
          const customers = customersResponse.data || [];
          const existingCustomer = customers.find(c => c.userId === selectedUserId);
          if (existingCustomer) {
            customerId = existingCustomer.id;
          } else {
            // If no customer exists, we might need to create one first
            // For now, use userId as customerId (backend might handle this)
            customerId = selectedUserId;
          }
        } catch (error) {
          console.error("Failed to find customer:", error);
          // Use userId as fallback
          customerId = selectedUserId;
        }
      }

      await CustomerService.updateCustomer(customerId, {
        fullName: formData.fullName.trim(),
        gender: formData.gender || null,
        dob: formData.dob || null,
        mobile: formData.mobile.trim(),
        whatsapp: formData.whatsapp.trim() || null,
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        pincode: formData.pincode.trim() || null,
        capLockYears: formData.capLockYears ? parseInt(formData.capLockYears, 10) : 0,
        kycStatus: "pending",
      });

      setToast({ message: "Customer saved successfully", type: "success" });

      // Redirect to customers list after 1.5 seconds
      setTimeout(() => {
        router.push("/staff/customers");
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save customer. Please try again.";
      setToast({ message: errorMessage, type: "error" });

      // Set field-specific errors if provided by API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <Link href="/staff/customers">
          <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Add New Customer</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 mt-0.5">
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Register a new user to the system manually.</p>

            {/* User Search Dropdown */}
            <div className="relative flex-1 sm:flex-none sm:min-w-[250px]" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search user by name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-8 pr-8 py-1.5 sm:py-2 bg-background border border-input rounded-md text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setShowDropdown(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown Results */}
              {showDropdown && searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {isLoadingUsers ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">Loading users...</div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
                      >
                        <div className="text-xs sm:text-sm font-medium text-foreground">{getUserName(user)}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                          {user.email || "No email"} • {user.phone || user.mobile || "No phone"}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-muted-foreground">No users found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">

          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="fullName" className="text-xs sm:text-sm font-medium text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${errors.fullName ? "border-destructive" : "border-input"
                }`}
              placeholder="Enter full name"
            />
            {errors.fullName && (
              <p className="text-xs text-destructive text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="mobile" className="text-xs sm:text-sm font-medium text-foreground">
                Mobile Number <span className="text-destructive">*</span>
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${errors.mobile ? "border-destructive" : "border-input"
                  }`}
                placeholder="7894561320"
              />
              {errors.mobile && (
                <p className="text-xs text-destructive text-red-500">{errors.mobile}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="whatsapp" className="text-xs sm:text-sm font-medium text-foreground">
                WhatsApp Number <span className="text-destructive">*</span>
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="7894561320"
              />
              {errors.whatsapp && (
                <p className="text-xs text-destructive text-red-500">{errors.whatsapp}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="email" className="text-xs sm:text-sm font-medium text-foreground">
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${errors.email ? "border-destructive" : "border-input"
                  }`}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="gender" className="text-xs sm:text-sm font-medium text-foreground">
                Gender <span className="text-destructive">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-destructive text-red-500">{errors.gender}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="dob" className="text-xs sm:text-sm font-medium text-foreground">
                Date of Birth <span className="text-destructive">*</span>
              </label>
              <PremiumDobPicker
                value={formData.dob}
                onChange={(val) => setFormData(prev => ({ ...prev, dob: val }))}
                error={errors.dob}
              />
              {errors.dob && (
                <p className="text-xs text-destructive text-red-500 mt-1">{errors.dob}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="address" className="text-xs sm:text-sm font-medium text-foreground">
              Address <span className="text-destructive">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y ${errors.address ? "border-destructive" : "border-input"
                }`}
              placeholder="Enter full address"
            ></textarea>
            {errors.address && (
              <p className="text-xs text-destructive text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="city" className="text-xs sm:text-sm font-medium text-foreground">
                City <span className="text-destructive">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="text-xs text-destructive text-red-500">{errors.city}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="state" className="text-xs sm:text-sm font-medium text-foreground">
                State <span className="text-destructive">*</span>
              </label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter state"
              />
              {errors.state && (
                <p className="text-xs text-destructive text-red-500">{errors.state}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="pincode" className="text-xs sm:text-sm font-medium text-foreground">
                Pincode <span className="text-destructive">*</span>
              </label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter pincode"
              />
              {errors.pincode && (
                <p className="text-xs text-destructive text-red-500">{errors.pincode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="capLockYears" className="text-xs sm:text-sm font-medium text-foreground">Cap Lock Years</label>
              <select
                id="capLockYears"
                name="capLockYears"
                value={formData.capLockYears}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="0">0 Years (No Lock)</option>
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3 Years</option>
                <option value="4">4 Years</option>
                <option value="5">5 Years</option>
                <option value="6">6 Years</option>
                <option value="7">7 Years</option>
                <option value="8">8 Years</option>
                <option value="9">9 Years</option>
                <option value="10">10 Years</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="initialDeposit" className="text-xs sm:text-sm font-medium text-foreground">Initial Deposit (Optional)</label>
              <input
                id="initialDeposit"
                name="initialDeposit"
                type="number"
                value={formData.initialDeposit}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Link href="/staff/customers" className="w-full sm:w-auto">
              <button type="button" className="w-full sm:w-auto px-4 py-2 sm:py-2.5 border border-input bg-transparent rounded-md text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} className="sm:w-4 sm:h-4 shrink-0" />
              <span>{isLoading ? "Saving..." : "Save Customer"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
