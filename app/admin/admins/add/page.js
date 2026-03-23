"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, ShieldPlus } from "lucide-react";
import Toast from "@/components/Toast";
import AdminService from "@/services/admin/admin.service";

export default function AddAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await AdminService.createAdmin(formData);
      setToast({ message: "Admin created successfully!", type: "success" });
      setTimeout(() => router.push("/admin/admins"), 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create admin";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/admin/admins">
          <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
        </Link>
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldPlus size={24} className="text-primary" /> Create New Admin
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Define a new administrator with full platform access.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <input
                type="text"
                name="firstname"
                required
                value={formData.firstname}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <input
                type="text"
                name="lastname"
                required
                value={formData.lastname}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <input
                type="text"
                name="phone"
                required
                pattern="[0-9]{10}"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="10-digit mobile number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Temporary Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="••••••••"
              />
              <p className="text-[10px] text-muted-foreground italic">Password must be at least 6 characters.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border">
            <Link href="/admin/admins">
              <button type="button" className="w-full sm:w-auto px-6 py-2 border border-input rounded-md text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save size={16} /> <span>Create Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-xs sm:text-sm text-primary/80">
        <p className="font-semibold mb-1">Security Notice:</p>
        <p>This will create a user with full administrative privileges. Ensure that the provided email or phone number is correct, as they will be used for future authentication and recovery.</p>
      </div>
    </div>
  );
}
