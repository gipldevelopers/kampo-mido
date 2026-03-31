"use client";
import { useState, useEffect } from "react";
import {
  User,
  Save,
  Lock,
  Bell,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  ShieldCheck
} from "lucide-react";
import Toast from "@/components/Toast";
import AdminProfileService from "../../../services/admin/admin-profile.service";

// --- Toggle Switch Component ---
const ToggleSwitch = ({ enabled, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg border border-border gap-2 sm:gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-foreground break-words">{label}</p>
        {description && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 break-words">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shrink-0 ${enabled ? 'bg-primary' : 'bg-muted'
          }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-4 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
            }`}
        />
      </button>
    </div>
  );
};

export default function StaffProfile() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Profile State
  const [name, setName] = useState("Staff Member");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification Preferences State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Staff uses the same profile endpoint as admin in the backend
      const response = await AdminProfileService.getProfile();

      if (response.success) {
        const userData = response.data;
        setFirstName(userData.firstname || "");
        setLastName(userData.lastname || "");
        setEmail(userData.email || "");
        setPhone(userData.phone || "");
        setName(`${userData.firstname || ''} ${userData.lastname || ''}`.trim() || "Staff Member");

        if (userData.profilePicture) {
          setProfilePicturePreview(userData.profilePicture);
        }
      } else {
        setToast({
          message: response.message || "Failed to load profile",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setToast({
        message: error.response?.data?.message || "Failed to load profile",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: "Image size should be less than 5MB", type: "error" });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setToast({ message: "Please select a valid image file", type: "error" });
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setToast({ message: "Please enter your first and last name", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const profileData = {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        email: email,
        phone: phone || "",
        profilePicture: profilePicture
      };

      const response = await AdminProfileService.updateProfile(profileData);

      if (response.success) {
        setToast({
          message: response.message || "Profile updated successfully!",
          type: "success"
        });
        setName(`${firstName} ${lastName}`.trim());
        fetchProfile();
      } else {
        setToast({
          message: response.message || "Failed to update profile",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({
        message: error.response?.data?.message || "Failed to update profile",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      setToast({ message: "Please enter your current password", type: "error" });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setToast({ message: "New password must be at least 8 characters", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ message: "New passwords do not match", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const passwordData = {
        currentPassword,
        newPassword,
        confirmPassword
      };

      const response = await AdminProfileService.changePassword(passwordData);

      if (response.success) {
        setToast({
          message: response.message || "Password changed successfully!",
          type: "success"
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setToast({
          message: response.message || "Failed to change password",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setToast({
        message: error.response?.data?.message || "Failed to change password",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ message: "Notification preferences saved successfully!", type: "success" });
    }, 1000);
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Staff Profile</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Manage your staff account and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">

        {/* LEFT COLUMN: Profile & Password (Span 2) */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">

          {/* Profile Information Card */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <User size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">Profile Information</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Profile Picture Upload */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Profile Picture</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="sm:w-10 sm:h-10 text-muted-foreground" />
                      )}
                    </div>
                    {profilePicturePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="absolute -top-1 -right-1 p-0.5 sm:p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
                      >
                        <X size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-xs sm:text-sm font-medium hover:bg-muted/80 transition-colors w-full sm:w-fit">
                        <Upload size={14} className="sm:w-4 sm:h-4 shrink-0" />
                        <span>{profilePicturePreview ? "Change Picture" : "Upload Picture"}</span>
                      </div>
                    </label>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 sm:py-2.5 bg-muted border border-input rounded-md text-sm text-muted-foreground cursor-not-allowed transition-all"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin shrink-0" /> <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Update Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <Lock size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">Change Password</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 sm:py-2.5 pr-9 sm:pr-10 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    className="w-full px-3 py-2 sm:py-2.5 pr-9 sm:pr-10 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 sm:py-2.5 pr-9 sm:pr-10 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] sm:text-xs text-destructive">Passwords do not match.</p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin shrink-0" /> <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Preferences (Span 1) */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">

          {/* Preferences Card */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <Bell size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">Preferences</h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={emailNotifications}
                  onChange={setEmailNotifications}
                  label="Email Notifications"
                  description="Receive platform email alerts"
                />
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={transactionAlerts}
                  onChange={setTransactionAlerts}
                  label="Transaction Alerts"
                  description="Get notified about new deposits"
                />
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={systemUpdates}
                  onChange={setSystemUpdates}
                  label="System Updates"
                  description="Receive maintenance updates"
                />
              </div>
            </div>

            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border">
              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin shrink-0" /> : <Save size={14} className="sm:w-4 sm:h-4 shrink-0" />}
                <span>Save Preferences</span>
              </button>
            </div>
          </div>

          {/* Role Info Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm text-muted-foreground min-w-0 flex-1">
                <p className="font-medium text-foreground mb-1">Staff Permissions</p>
                <ul className="text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 list-disc list-inside">
                  <li>Manage customer records</li>
                  <li>Convert users to customers</li>
                  <li>Approve and add manual deposits</li>
                  <li>View transaction history</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
