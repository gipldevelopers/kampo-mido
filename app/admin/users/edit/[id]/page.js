"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import UserService from "@/services/admin/user.service";
import Toast from "@/components/Toast";

export default function EditUser({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [toast, setToast] = useState(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      setIsFetching(true);
      try {
        const response = await UserService.getUserById(id);
        
        // Handle different response structures
        const user = response.data?.user || response.data || response.user || response;
        
        if (user) {
          setFormData({
            firstname: user.firstname || user.firstName || "",
            lastname: user.lastname || user.lastName || "",
            email: user.email || "",
            phone: user.phone || user.mobile || "",
            address: user.address || "",
            role: user.role || "",
            status: user.status || "active",
          });
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch user data";
        setToast({ message: errorMessage, type: "error" });
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ message: "Please fill in all required fields correctly", type: "error" });
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      await UserService.updateUser(id, {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        status: formData.status,
      });

      setToast({ message: "User updated successfully", type: "success" });
      
      // Redirect to users list after 1.5 seconds
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update user. Please try again.";
      setToast({ message: errorMessage, type: "error" });
      
      // Set field-specific errors if provided by API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full">
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <Link href="/admin/users">
          <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Edit User</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Update user information in the system.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="firstname" className="text-xs sm:text-sm font-medium text-foreground">First Name</label>
              <input 
                id="firstname"
                name="firstname"
                type="text" 
                value={formData.firstname}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.firstname ? "border-destructive" : "border-input"
                }`}
                placeholder="Enter first name" 
              />
              {errors.firstname && (
                <p className="text-xs text-destructive">{errors.firstname}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="lastname" className="text-xs sm:text-sm font-medium text-foreground">Last Name</label>
              <input 
                id="lastname"
                name="lastname"
                type="text" 
                value={formData.lastname}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.lastname ? "border-destructive" : "border-input"
                }`}
                placeholder="Enter last name" 
              />
              {errors.lastname && (
                <p className="text-xs text-destructive">{errors.lastname}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="email" className="text-xs sm:text-sm font-medium text-foreground">Email Address</label>
              <input 
                id="email"
                name="email"
                type="email" 
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.email ? "border-destructive" : "border-input"
                }`}
                placeholder="user@example.com" 
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="phone" className="text-xs sm:text-sm font-medium text-foreground">Phone Number</label>
              <input 
                id="phone"
                name="phone"
                type="tel" 
                value={formData.phone}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 sm:py-2.5 bg-muted border border-input rounded-md text-sm text-muted-foreground cursor-not-allowed"
                placeholder="+91 00000 00000" 
              />
              <p className="text-xs text-muted-foreground">Phone number cannot be changed</p>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="address" className="text-xs sm:text-sm font-medium text-foreground">Address</label>
            <textarea 
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled
              className="w-full px-3 py-2 sm:py-2.5 bg-muted border border-input rounded-md text-sm text-muted-foreground cursor-not-allowed min-h-[80px] sm:min-h-[100px] resize-y"
              placeholder="Enter full address"
            ></textarea>
            <p className="text-xs text-muted-foreground">Address cannot be changed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="role" className="text-xs sm:text-sm font-medium text-foreground">Role</label>
              <select 
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 sm:py-2.5 bg-muted border border-input rounded-md text-sm text-muted-foreground cursor-not-allowed"
              >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
              <p className="text-xs text-muted-foreground">Role cannot be changed</p>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="status" className="text-xs sm:text-sm font-medium text-foreground">Status</label>
              <select 
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <Link href="/admin/users" className="w-full sm:w-auto">
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
              <span>{isLoading ? "Updating..." : "Update User"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

