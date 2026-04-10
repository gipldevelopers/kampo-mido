"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, UserCog, AlertTriangle } from "lucide-react";
import Toast from "@/components/Toast";
import AdminService from "@/services/admin/admin.service";

export default function EditAdmin(props) {
  const params = use(props.params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "", // Keep empty if not changing
    role: "admin",
    status: "active",
  });

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await AdminService.getAdminById(params.id);
        if (response.success && response.data) {
          const admin = response.data;
          setFormData({
            firstname: admin.firstname || "",
            lastname: admin.lastname || "",
            email: admin.email || "",
            phone: admin.phone || "",
            password: "", // Clear for security
            role: admin.role || "admin",
            status: admin.status || "active",
          });
        }
      } catch (error) {
        setToast({ message: "Failed to load admin data", type: "error" });
        setTimeout(() => router.push("/admin/admins"), 2000);
      } finally {
        setFetching(false);
      }
    };
    fetchAdmin();
  }, [params.id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password; // Don't send empty password

      await AdminService.updateAdmin(params.id, updateData);
      setToast({ message: "Admin updated successfully!", type: "success" });
      setTimeout(() => router.push("/admin/admins"), 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update admin";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse text-sm">Fetching administrator profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 max-w-8xl mx-auto pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/admin/admins">
          <button className="p-1.5 sm:p-2 hover:bg-card border border-border rounded-full transition-colors shrink-0">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
        </Link>
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCog size={24} className="text-primary" /> Edit Admin/Staff Profile
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Modify the administrative account details.</p>
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
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reset Password (Optional)</label>
              <input
                type="password"
                name="password"
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                placeholder="Leave blank to keep current"
              />
              <p className="text-[10px] text-muted-foreground italic">If entered, must be at least 6 characters.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">User Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Current Status</label>
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
                  <Loader2 size={16} className="animate-spin" /> <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save size={16} /> <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-xs sm:text-sm text-destructive/80 flex items-start gap-3">
        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Administrative Action:</p>
          <p>Carefully update administrative details. Security or role changes should only be made after proper verification.</p>
        </div>
      </div>
    </div>
  );
}
