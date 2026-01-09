"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Search, X } from "lucide-react";
import UserService from "@/services/admin/user.service";
import CustomerService from "@/services/admin/customer.service";
import Toast from "@/components/Toast";

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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (formData.dob) {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      // Reset time for accurate date comparison
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        newErrors.dob = "Date of Birth cannot be in the future";
      }
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
        kycStatus: "pending",
      });

      setToast({ message: "Customer saved successfully", type: "success" });

      // Redirect to customers list after 1.5 seconds
      setTimeout(() => {
        router.push("/admin/customers");
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
        <Link href="/admin/customers">
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
              <label htmlFor="whatsapp" className="text-xs sm:text-sm font-medium text-foreground">WhatsApp Number</label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="7894561320"
              />
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
              <label htmlFor="gender" className="text-xs sm:text-sm font-medium text-foreground">Gender</label>
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
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="dob" className="text-xs sm:text-sm font-medium text-foreground">Date of Birth</label>
              <input
                id="dob"
                name="dob"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.dob}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${errors.dob ? "border-destructive" : "border-input"}`}
              />
              {errors.dob && (
                <p className="text-xs text-destructive text-red-500">{errors.dob}</p>
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
              <label htmlFor="city" className="text-xs sm:text-sm font-medium text-foreground">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="state" className="text-xs sm:text-sm font-medium text-foreground">State</label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter state"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="pincode" className="text-xs sm:text-sm font-medium text-foreground">Pincode</label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter pincode"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
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
            <Link href="/admin/customers" className="w-full sm:w-auto">
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
