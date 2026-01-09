"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import UserService from "@/services/admin/user.service";
import Toast from "@/components/Toast";

export default function AddUser() {
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
  const [toast, setToast] = useState(null);

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

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
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
      await UserService.register({
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        status: formData.status,
      });

      setToast({ message: "User registered successfully", type: "success" });
      
      // Redirect to users list after 1.5 seconds
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to register user. Please try again.";
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
        <Link href="/admin/users">
          <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-muted-foreground" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Add New User</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Register a new user to the system manually.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="firstname" className="text-xs sm:text-sm font-medium text-foreground">
                First Name <span className="text-destructive">*</span>
              </label>
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
                <p className="text-xs text-destructive text-red-500">{errors.firstname}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="lastname" className="text-xs sm:text-sm font-medium text-foreground">
                Last Name <span className="text-destructive">*</span>
              </label>
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
                <p className="text-xs text-destructive text-red-500">{errors.lastname}</p>
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
                className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.email ? "border-destructive" : "border-input"
                }`}
                placeholder="user@example.com" 
              />
              {errors.email && (
                <p className="text-xs text-destructive text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="phone" className="text-xs sm:text-sm font-medium text-foreground">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input 
                id="phone"
                name="phone"
                type="tel" 
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.phone ? "border-destructive" : "border-input"
                }`}
                placeholder="7894561320" 
              />
              {errors.phone && (
                <p className="text-xs text-destructive text-red-500">{errors.phone}</p>
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
              className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y ${
                errors.address ? "border-destructive" : "border-input"
              }`}
              placeholder="Enter full address"
            ></textarea>
            {errors.address && (
              <p className="text-xs text-destructive text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="role" className="text-xs sm:text-sm font-medium text-foreground">
                Role <span className="text-destructive">*</span>
              </label>
              <select 
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 sm:py-2.5 bg-background border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.role ? "border-destructive" : "border-input"
                }`}
              >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
              {errors.role && (
                <p className="text-xs text-destructive text-red-500">{errors.role}</p>
              )}
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
              <span>{isLoading ? "Registering..." : "Save User"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

