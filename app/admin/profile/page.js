"use client";
import { useState } from "react";
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
  Camera,
  X
} from "lucide-react";
import Toast from "@/components/Toast";

// --- Toggle Switch Component ---
const ToggleSwitch = ({ enabled, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
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
  const [email, setEmail] = useState("admin@kampomido.com");
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

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ message: "Please enter your name", type: "error" });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ message: "Profile updated successfully!", type: "success" });
    }, 1000);
  };

  const handleChangePassword = (e) => {
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

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ message: "Password changed successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  const handleSaveNotifications = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ message: "Notification preferences saved successfully!", type: "success" });
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Admin Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your profile settings and preferences.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Profile & Password (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Information Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Profile Picture</label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
                      {profilePicturePreview ? (
                        <img 
                          src={profilePicturePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={40} className="text-muted-foreground" />
                      )}
                    </div>
                    {profilePicturePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-input rounded-md text-sm font-medium hover:bg-muted/80 transition-colors w-fit">
                        <Upload size={16} />
                        {profilePicturePreview ? "Change Picture" : "Upload Picture"}
                      </div>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kampomido.com"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed. Contact system administrator.</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Lock size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 pr-10 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    className="w-full px-3 py-2 pr-10 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Password must be at least 8 characters long.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 pr-10 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <CheckCircle2 size={12} /> Passwords match.
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Changing...
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Notification Preferences (Span 1) */}
        <div className="space-y-6">
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Bell size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
            </div>
            
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <ToggleSwitch
                  enabled={emailNotifications}
                  onChange={setEmailNotifications}
                  label="Email Notifications"
                  description="Receive notifications via email"
                />
              </div>

              {/* SMS Notifications */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <ToggleSwitch
                  enabled={smsNotifications}
                  onChange={setSmsNotifications}
                  label="SMS Notifications"
                  description="Receive notifications via SMS"
                />
              </div>

              {/* WhatsApp Notifications */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <ToggleSwitch
                  enabled={whatsappNotifications}
                  onChange={setWhatsappNotifications}
                  label="WhatsApp Notifications"
                  description="Receive notifications via WhatsApp"
                />
              </div>

              {/* Weekly Reports */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <ToggleSwitch
                  enabled={weeklyReports}
                  onChange={setWeeklyReports}
                  label="Weekly Reports"
                  description="Receive weekly summary reports"
                />
              </div>

              {/* Transaction Alerts */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <ToggleSwitch
                  enabled={transactionAlerts}
                  onChange={setTransactionAlerts}
                  label="Transaction Alerts"
                  description="Get notified about important transactions"
                />
              </div>

              {/* System Updates */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <ToggleSwitch
                  enabled={systemUpdates}
                  onChange={setSystemUpdates}
                  label="System Updates"
                  description="Receive system maintenance and update notifications"
                />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Preferences
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Security Tips</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
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

