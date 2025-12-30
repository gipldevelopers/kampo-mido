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
  QrCode,
  CreditCard,
  Copy // Add Copy import
} from "lucide-react";
import Toast from "@/components/Toast";
import CustomerProfileService from "../../../services/admin/admin-profile.service";
import UPIService from "../../../services/upi.service";

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

export default function AdminProfile() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Profile State
  const [name, setName] = useState("Admin User");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("admin@kampomido.com");
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
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);

  // UPI Settings State
  const [upiId, setUpiId] = useState("");
  const [currentUPI, setCurrentUPI] = useState("");
  const [loadingUPI, setLoadingUPI] = useState(false);
  const [upiQRCode, setUpiQRCode] = useState("");
  const [upiLastUpdated, setUpiLastUpdated] = useState(""); // Store last updated time

  useEffect(() => {
    fetchProfile();
    fetchUPISettings();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await CustomerProfileService.getProfile();

      if (response.success) {
        const userData = response.data;
        setFirstName(userData.firstname || "");
        setLastName(userData.lastname || "");
        setEmail(userData.email || "admin@kampomido.com");
        setPhone(userData.phone || "");
        setName(`${userData.firstname || ''} ${userData.lastname || ''}`.trim() || "Admin User");

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

  const fetchUPISettings = async () => {
    try {
      setLoadingUPI(true);
      const response = await UPIService.getUPISettings();

      console.log("UPI Settings Response:", response);

      if (response.success && response.data) {
        const upiData = response.data;

        if (upiData.value) {
          const storedUpiId = upiData.value;
          setCurrentUPI(storedUpiId);
          setUpiId(storedUpiId);

          // Store the last updated time
          if (upiData.updatedAt) {
            setUpiLastUpdated(upiData.updatedAt);
          }

          // Try to get QR code, but don't fail if we can't (admin might not have access to customer endpoint)
          fetchQRCode(storedUpiId);
        } else {
          setToast({
            message: "UPI ID not configured yet",
            type: "info"
          });
        }
      } else {
        setToast({
          message: response.message || "Failed to load UPI settings",
          type: "warning"
        });
      }
    } catch (error) {
      console.error('Error fetching UPI settings:', error);
      setToast({
        message: error.response?.data?.message || "Failed to load UPI settings",
        type: "warning"
      });
    } finally {
      setLoadingUPI(false);
    }
  };

  // Separate function to fetch QR code
  const fetchQRCode = async (upiId) => {
    try {
      // Try to get QR code from customer endpoint first
      const qrResponse = await UPIService.getUPISettings();
      if (qrResponse.success && qrResponse.data && qrResponse.data.qrCode) {
        setUpiQRCode(qrResponse.data.qrCode);
      } else {
        // Fallback: Generate QR code locally if API fails
        generateLocalQRCode(upiId);
      }
    } catch (qrError) {
      console.warn('Could not fetch QR code from API, generating locally:', qrError);
      // Admin might not have access to customer endpoint (403), so generate QR locally
      generateLocalQRCode(upiId);
    }
  };

  // Generate QR code locally as fallback
  const generateLocalQRCode = (upiId) => {
    if (!upiId) return;

    const merchantName = "Kampo Mido";
    const upiPaymentLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&cu=INR`;

    // Use a free QR code generator service
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPaymentLink)}&format=png&margin=10&color=333333&bgcolor=ffffff`;

    setUpiQRCode(qrCodeUrl);
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
        phone: phone || ""
      };

      const response = await CustomerProfileService.updateProfile(profileData);

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

      const response = await CustomerProfileService.changePassword(passwordData);

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

  const handleUpdateUPI = async (e) => {
    e.preventDefault();

    if (!upiId.trim()) {
      setToast({ message: "Please enter a valid UPI ID", type: "error" });
      return;
    }

    // Validate UPI ID format (basic validation)
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId.trim())) {
      setToast({
        message: "Please enter a valid UPI ID (e.g., username@bank)",
        type: "error"
      });
      return;
    }

    try {
      setLoadingUPI(true);

      const upiData = {
        upiId: upiId.trim()
      };

      const response = await UPIService.updateUPI(upiData);

      if (response.success) {
        setToast({
          message: response.message || "UPI ID updated successfully!",
          type: "success"
        });
        setCurrentUPI(upiId.trim());

        // Store the update time from response
        if (response.data && response.data.updatedAt) {
          setUpiLastUpdated(response.data.updatedAt);
        } else {
          // If not in response, use current time
          setUpiLastUpdated(new Date().toISOString());
        }

        // Refresh UPI settings
        await fetchUPISettings();

        // Generate new QR code locally
        generateLocalQRCode(upiId.trim());

      } else {
        setToast({
          message: response.message || "Failed to update UPI ID",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Error updating UPI:', error);
      setToast({
        message: error.response?.data?.message || "Failed to update UPI ID",
        type: "error"
      });
    } finally {
      setLoadingUPI(false);
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
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Admin Profile</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Manage your profile settings and preferences.</p>
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
                  <label className="text-xs sm:text-sm font-medium text-foreground">First Name</label>
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
                  <label className="text-xs sm:text-sm font-medium text-foreground">Last Name</label>
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kampomido.com"
                  className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  required
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Email cannot be changed. Contact system administrator.</p>
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

          {/* UPI Settings Card */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <CreditCard size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">UPI Settings</h3>
            </div>

            <form onSubmit={handleUpdateUPI} className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">UPI ID</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g., username@bank"
                    className="flex-1 px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loadingUPI}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loadingUPI ? (
                      <>
                        <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin shrink-0" /> <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Save UPI</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Enter your UPI ID (e.g., username@paytm, username@oksbi, username@ybl)
                </p>
              </div>

              {/* Current UPI ID Display */}
              {currentUPI && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground mb-1">Current UPI ID</p>
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="sm:w-4 sm:h-4 text-primary shrink-0" />
                        <p className="text-sm font-medium text-foreground break-all">{currentUPI}</p>
                      </div>
                      {upiLastUpdated && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          Last updated: {new Date(upiLastUpdated).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(currentUPI);
                        setToast({ message: "UPI ID copied to clipboard!", type: "success" });
                      }}
                      className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title="Copy UPI ID"
                    >
                      <Copy size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* QR Code Preview */}
              {upiQRCode && (
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">QR Code Preview</label>
                  <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center">
                    <img
                      src={upiQRCode}
                      alt="UPI QR Code"
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
                      onError={(e) => {
                        console.error("Failed to load QR code image");
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex flex-col items-center justify-center">
                            <svg class="w-12 h-12 text-destructive mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p class="text-xs text-muted-foreground text-center">QR code failed to load</p>
                          </div>
                        `;
                      }}
                    />
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 text-center">
                      Customers will scan this QR code for payments
                    </p>
                  </div>
                </div>
              )}

              {/* UPI Information Card */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-xs sm:text-sm text-muted-foreground min-w-0 flex-1">
                    <p className="font-medium text-foreground mb-1">UPI Information</p>
                    <ul className="text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 list-disc list-inside">
                      <li>Update UPI ID to receive customer payments</li>
                      <li>QR code automatically generates when you save</li>
                      <li>Customers will use this QR for deposit payments</li>
                      <li>Ensure UPI ID is correct before saving</li>
                    </ul>
                  </div>
                </div>
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
                <p className="text-[10px] sm:text-xs text-muted-foreground">Password must be at least 8 characters long.</p>
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
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                  <p className="text-[10px] sm:text-xs text-primary flex items-center gap-1">
                    <CheckCircle2 size={10} className="sm:w-3 sm:h-3 shrink-0" /> <span>Passwords match.</span>
                  </p>
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

        {/* RIGHT COLUMN: Notification Preferences (Span 1) */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">

          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <Bell size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">Notification Preferences</h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Email Notifications */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={emailNotifications}
                  onChange={setEmailNotifications}
                  label="Email Notifications"
                  description="Receive notifications via email"
                />
              </div>

              {/* SMS Notifications */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={smsNotifications}
                  onChange={setSmsNotifications}
                  label="SMS Notifications"
                  description="Receive notifications via SMS"
                />
              </div>

              {/* WhatsApp Notifications */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={whatsappNotifications}
                  onChange={setWhatsappNotifications}
                  label="WhatsApp Notifications"
                  description="Receive notifications via WhatsApp"
                />
              </div>

              {/* Weekly Reports */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={weeklyReports}
                  onChange={setWeeklyReports}
                  label="Weekly Reports"
                  description="Receive weekly summary reports"
                />
              </div>

              {/* Transaction Alerts */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={transactionAlerts}
                  onChange={setTransactionAlerts}
                  label="Transaction Alerts"
                  description="Get notified about important transactions"
                />
              </div>

              {/* System Updates */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={systemUpdates}
                  onChange={setSystemUpdates}
                  label="System Updates"
                  description="Receive system maintenance and update notifications"
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

          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm text-muted-foreground min-w-0 flex-1">
                <p className="font-medium text-foreground mb-1">Security Tips</p>
                <ul className="text-[10px] sm:text-xs space-y-0.5 sm:space-y-1 list-disc list-inside">
                  <li>Use a strong, unique password</li>
                  <li>Change your password regularly</li>
                  <li>Never share your credentials</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}