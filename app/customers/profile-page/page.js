"use client";
import { useState, useEffect } from "react";
import {
  User,
  Save,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Upload,
  X,
  Calendar,
  ShieldCheck
} from "lucide-react";
import Toast from "@/components/Toast";
import CustomerProfileService from "@/services/customer/profile.service";

export default function CustomerProfile() {
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Profile State
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Account Info State
  const [accountNumber, setAccountNumber] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [kycStatus, setKycStatus] = useState("");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await CustomerProfileService.getProfile();
      const data = response.data || response;

      // Set profile data - using correct field names from API
      setName(data.fullName || ""); // Changed from data.name to data.fullName
      setMobile(data.mobile || "");
      setEmail(data.email || "");
      setAddress(data.address || "");
      setCity(data.city || "");
      setState(data.state || "");
      setPincode(data.pincode || "");

      // Set account info
      setAccountNumber(data.accountNumber || "N/A");
      // Use createdAt for memberSince since it's available in the API response
      setMemberSince(data.createdAt || "N/A");
      setKycStatus(data.kycStatus || "Pending");

      // Set profile picture if exists
      if (data.profilePicture) {
        setProfilePicturePreview(data.profilePicture);
      }

      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setToast({
        message: error.response?.data?.message || "Failed to load profile data",
        type: "error"
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

    // Validation
    if (!name.trim()) {
      setToast({ message: "Please enter your name", type: "error" });
      return;
    }
    if (!mobile.trim()) {
      setToast({ message: "Please enter your mobile number", type: "error" });
      return;
    }
    if (!email.trim()) {
      setToast({ message: "Please enter your email", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const profileUpdateData = {
        fullName: name.trim(), // Changed key to match backend expectation
        mobile: mobile.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        profilePicture
      };

      const response = await CustomerProfileService.updateProfile(profileUpdateData);

      // Update profile picture preview from response if available
      if (response.data?.profilePicture) {
        setProfilePicturePreview(response.data.profilePicture);
      }

      setProfilePicture(null); // Clear the file object after successful upload

      setToast({
        message: response.message || "Profile updated successfully!",
        type: "success"
      });

      // Refresh profile data
      fetchProfileData();

    } catch (error) {
      console.error("Error updating profile:", error);
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

    // Validation
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
      setPasswordLoading(true);

      const passwordData = {
        currentPassword,
        newPassword,
        confirmPassword
      };

      const response = await CustomerProfileService.changePassword(passwordData);

      setToast({
        message: response.message || "Password changed successfully!",
        type: "success"
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error("Error changing password:", error);
      setToast({
        message: error.response?.data?.message || "Failed to change password",
        type: "error"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const getKycStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'verified':
        return 'text-primary';
      case 'pending':
      case 'in_progress':
        return 'text-yellow-500';
      case 'rejected':
      case 'failed':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getKycStatusText = (status) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">My Profile</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">Manage your profile information and settings.</p>
        </div>
      </div>

      {loading && !profileData ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">

          {/* LEFT COLUMN: Profile & Password (Span 2) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">

            {/* Profile Information Card */}
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
                <User size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Profile Information</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Profile Picture Upload */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Profile Picture</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
                        {profilePicturePreview ? (
                          <img
                            src={
                              profilePicturePreview.startsWith('http') || profilePicturePreview.startsWith('data:')
                                ? profilePicturePreview
                                : `${baseURL}/${profilePicturePreview}`
                            }
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
                          className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
                          aria-label="Remove profile picture"
                        >
                          <X size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-[11px] sm:text-xs md:text-sm font-medium hover:bg-muted/80 transition-colors w-full sm:w-fit">
                          <Upload size={14} className="sm:w-4 sm:h-4" />
                          <span>{profilePicturePreview ? "Change Picture" : "Upload Picture"}</span>
                        </div>
                      </label>
                      <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-1.5 sm:mt-2">JPG, PNG or GIF. Max size 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Mobile Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Address <span className="text-red-500">*</span></label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete address"
                    className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[80px] sm:min-h-[100px] resize-y"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Enter state"
                      className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter pincode"
                      className="w-full px-2.5 sm:px-3 py-2 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-[11px] sm:text-xs md:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} className="sm:w-4 sm:h-4" /> <span>Update Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
                <Lock size={18} className="sm:w-5 sm:h-5 text-primary shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Change Password</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-2.5 sm:px-3 py-2 pr-8 sm:pr-10 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 8 characters)"
                      className="w-full px-2.5 sm:px-3 py-2 pr-8 sm:pr-10 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">Password must be at least 8 characters long.</p>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-2.5 sm:px-3 py-2 pr-8 sm:pr-10 bg-background border border-input rounded-md text-[11px] sm:text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-destructive">Passwords do not match.</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-primary flex items-center gap-1">
                      <CheckCircle2 size={10} className="sm:w-3 sm:h-3" /> Passwords match.
                    </p>
                  )}
                </div>

                <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-[11px] sm:text-xs md:text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" /> <span>Changing...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} className="sm:w-4 sm:h-4" /> <span>Change Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* RIGHT COLUMN: Account Info (Span 1) */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">

            {/* Account Information */}
            <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Account Information</h3>

              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mb-1">Account Number</p>
                  <p className="text-base sm:text-lg font-bold text-foreground">{accountNumber || "N/A"}</p>
                </div>

                <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-muted-foreground" />
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">Member Since</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-foreground mt-1">
                    {formatDate(memberSince)}
                  </p>
                </div>

                <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-muted-foreground" />
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">KYC Status</p>
                  </div>
                  <p className={`text-base sm:text-lg font-bold mt-1 ${getKycStatusColor(kycStatus)}`}>
                    {getKycStatusText(kycStatus)}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Security Tips</p>
              <ul className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground space-y-0.5 sm:space-y-1 list-disc list-inside">
                <li>Use a strong, unique password</li>
                <li>Change your password regularly</li>
                <li>Never share your credentials</li>
                <li>Keep your contact info updated</li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

