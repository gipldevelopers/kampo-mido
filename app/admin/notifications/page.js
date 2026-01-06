"use client";
import { useState } from "react";
import { 
  Bell, 
  Save,
  MessageSquare, 
  Mail, 
  Smartphone,
  FileText,
  Edit,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react";
import Toast from "@/components/Toast";

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
        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shrink-0 ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-4 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

// --- Template Preview Component ---
const TemplatePreview = ({ title, content, isEditing, onEdit, onSave, onCancel, onChange }) => {
  return (
    <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h4 className="text-xs sm:text-sm md:text-base font-semibold text-foreground break-words">{title}</h4>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="p-1.5 sm:p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors shrink-0"
            title="Edit Template"
          >
            <Edit size={14} className="sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-3 sm:space-y-4">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[150px] sm:min-h-[200px] font-mono resize-y"
            placeholder="Enter template content..."
          />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 border border-input bg-transparent rounded-md text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Save size={14} className="sm:w-4 sm:h-4 shrink-0" /> <span>Save Template</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-muted/30 p-3 sm:p-4 rounded-md border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap break-words">{content}</p>
        </div>
      )}
    </div>
  );
};

export default function NotificationManagement() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Admin Controls State
  const [weeklyStatementEnabled, setWeeklyStatementEnabled] = useState(true);
  const [weeklyStatementDay, setWeeklyStatementDay] = useState("Monday");
  const [weeklyStatementTime, setWeeklyStatementTime] = useState("09:00");
  
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappApiKey, setWhatsappApiKey] = useState("wapi_********************");
  const [whatsappApiSecret, setWhatsappApiSecret] = useState("wsec_********************");
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState("9876543210");
  
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsApiKey, setSmsApiKey] = useState("sms_********************");
  const [smsApiSecret, setSmsApiSecret] = useState("ssec_********************");
  const [smsSenderId, setSmsSenderId] = useState("KAMPOMD");
  
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailSmtpHost, setEmailSmtpHost] = useState("smtp.gmail.com");
  const [emailSmtpPort, setEmailSmtpPort] = useState("587");
  const [emailUsername, setEmailUsername] = useState("noreply@kampomido.com");
  const [emailPassword, setEmailPassword] = useState("****************");

  // System Sends State
  const [weeklyGoldUpdate, setWeeklyGoldUpdate] = useState(true);
  const [kycApproval, setKycApproval] = useState(true);
  const [withdrawalConfirmation, setWithdrawalConfirmation] = useState(true);
  const [depositConfirmation, setDepositConfirmation] = useState(true);

  // Template States
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingTemplateContent, setEditingTemplateContent] = useState("");
  const [templates, setTemplates] = useState({
    weeklyGoldUpdate: "Dear {{customer_name}},\n\nYour weekly gold value update:\n\nCurrent Gold Holdings: {{gold_amount}} g\nCurrent Rate: ₹{{gold_rate}}/g\nTotal Value: ₹{{total_value}}\n\nThank you for choosing Kampo Mido Jewellers.",
    kycApproval: "Dear {{customer_name}},\n\nCongratulations! Your KYC has been approved.\n\nYour account is now fully verified and you can enjoy all platform features.\n\nAccount Number: {{account_no}}\n\nThank you,\nKampo Mido Jewellers",
    withdrawalConfirmation: "Dear {{customer_name}},\n\nYour withdrawal request has been confirmed.\n\nAmount: ₹{{amount}}\nTransaction ID: {{txn_id}}\nStatus: {{status}}\n\nYour funds will be processed within 24-48 hours.\n\nThank you,\nKampo Mido Jewellers",
    depositConfirmation: "Dear {{customer_name}},\n\nYour deposit has been successfully received.\n\nAmount: ₹{{amount}}\nGold Added: {{gold_amount}} g\nTransaction ID: {{txn_id}}\n\nThank you for your trust in Kampo Mido Jewellers."
  });

  const handleSave = (section) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ message: `${section} settings saved successfully!`, type: "success" });
    }, 1000);
  };

  const handleEditTemplate = (templateKey) => {
    setEditingTemplate(templateKey);
    setEditingTemplateContent(templates[templateKey]);
  };

  const handleSaveTemplate = (templateKey) => {
    setTemplates(prev => ({ ...prev, [templateKey]: editingTemplateContent }));
    setEditingTemplate(null);
    setEditingTemplateContent("");
    setToast({ message: "Template updated successfully!", type: "success" });
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditingTemplateContent("");
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-4 sm:pb-6 md:pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">Notification Management</h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Configure notification channels and system messages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        
        {/* LEFT COLUMN: Admin Controls (Span 2) */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
          
          {/* Weekly Statement Settings */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <Calendar size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">Weekly Statement Settings</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <ToggleSwitch
                enabled={weeklyStatementEnabled}
                onChange={setWeeklyStatementEnabled}
                label="Enable Weekly Statements"
                description="Automatically send weekly account statements to customers"
              />
              
              {weeklyStatementEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Day of Week</label>
                    <select
                      value={weeklyStatementDay}
                      onChange={(e) => setWeeklyStatementDay(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    >
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                      <option>Saturday</option>
                      <option>Sunday</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Time</label>
                    <input
                      type="time"
                      value={weeklyStatementTime}
                      onChange={(e) => setWeeklyStatementTime(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSave("Weekly Statement")}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin shrink-0" /> : <Save size={14} className="sm:w-4 sm:h-4 shrink-0" />}
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp API Configuration */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <MessageSquare size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">WhatsApp API</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <ToggleSwitch
                enabled={whatsappEnabled}
                onChange={setWhatsappEnabled}
                label="Enable WhatsApp Notifications"
                description="Send notifications via WhatsApp Business API"
              />
              
              {whatsappEnabled && (
                <div className="space-y-3 sm:space-y-4 pt-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">API Key</label>
                    <input
                      type="text"
                      value={whatsappApiKey}
                      onChange={(e) => setWhatsappApiKey(e.target.value)}
                      placeholder="Enter WhatsApp API Key"
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">API Secret</label>
                    <input
                      type="password"
                      value={whatsappApiSecret}
                      onChange={(e) => setWhatsappApiSecret(e.target.value)}
                      placeholder="Enter WhatsApp API Secret"
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Phone Number</label>
                    <input
                      type="text"
                      value={whatsappPhoneNumber}
                      onChange={(e) => setWhatsappPhoneNumber(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSave("WhatsApp API")}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin shrink-0" /> : <Save size={14} className="sm:w-4 sm:h-4 shrink-0" />}
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* SMS API Configuration */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <Smartphone size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">SMS API</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <ToggleSwitch
                enabled={smsEnabled}
                onChange={setSmsEnabled}
                label="Enable SMS Notifications"
                description="Send notifications via SMS gateway"
              />
              
              {smsEnabled && (
                <div className="space-y-3 sm:space-y-4 pt-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">API Key</label>
                    <input
                      type="text"
                      value={smsApiKey}
                      onChange={(e) => setSmsApiKey(e.target.value)}
                      placeholder="Enter SMS API Key"
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">API Secret</label>
                    <input
                      type="password"
                      value={smsApiSecret}
                      onChange={(e) => setSmsApiSecret(e.target.value)}
                      placeholder="Enter SMS API Secret"
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Sender ID</label>
                    <input
                      type="text"
                      value={smsSenderId}
                      onChange={(e) => setSmsSenderId(e.target.value)}
                      placeholder="KAMPOMD"
                      maxLength={6}
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSave("SMS API")}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin shrink-0" /> : <Save size={14} className="sm:w-4 sm:h-4 shrink-0" />}
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <Mail size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">Email Configuration</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <ToggleSwitch
                enabled={emailEnabled}
                onChange={setEmailEnabled}
                label="Enable Email Notifications"
                description="Send notifications via SMTP email"
              />
              
              {emailEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">SMTP Host</label>
                    <input
                      type="text"
                      value={emailSmtpHost}
                      onChange={(e) => setEmailSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">SMTP Port</label>
                    <input
                      type="text"
                      value={emailSmtpPort}
                      onChange={(e) => setEmailSmtpPort(e.target.value)}
                      placeholder="587"
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Username</label>
                    <input
                      type="email"
                      value={emailUsername}
                      onChange={(e) => setEmailUsername(e.target.value)}
                      placeholder="noreply@kampomido.com"
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-foreground">Password</label>
                    <input
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Enter SMTP password"
                      className="w-full px-3 py-2 sm:py-2.5 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSave("Email Configuration")}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin shrink-0" /> : <Save size={14} className="sm:w-4 sm:h-4 shrink-0" />}
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <FileText size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">Email Templates</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(templates).map(([key, content]) => (
                <TemplatePreview
                  key={key}
                  title={key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
                  content={editingTemplate === key ? editingTemplateContent : content}
                  isEditing={editingTemplate === key}
                  onEdit={() => handleEditTemplate(key)}
                  onSave={() => handleSaveTemplate(key)}
                  onCancel={handleCancelEdit}
                  onChange={(newContent) => setEditingTemplateContent(newContent)}
                />
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: System Sends (Span 1) */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
              <Bell size={16} className="sm:w-5 sm:h-5 text-primary shrink-0" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">System Sends</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Weekly Gold Value Update */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={weeklyGoldUpdate}
                  onChange={setWeeklyGoldUpdate}
                  label="Weekly Gold Value Update"
                  description="Send weekly gold value updates to customers"
                />
                {weeklyGoldUpdate && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">Template Preview:</p>
                    <div className="bg-background p-2 sm:p-3 rounded-md text-[10px] sm:text-xs text-muted-foreground break-words">
                      {templates.weeklyGoldUpdate.substring(0, 100)}...
                    </div>
                  </div>
                )}
              </div>

              {/* KYC Approval Message */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={kycApproval}
                  onChange={setKycApproval}
                  label="KYC Approval Message"
                  description="Notify customers when KYC is approved"
                />
                {kycApproval && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">Template Preview:</p>
                    <div className="bg-background p-2 sm:p-3 rounded-md text-[10px] sm:text-xs text-muted-foreground break-words">
                      {templates.kycApproval.substring(0, 100)}...
                    </div>
                  </div>
                )}
              </div>

              {/* Withdrawal Confirmation */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={withdrawalConfirmation}
                  onChange={setWithdrawalConfirmation}
                  label="Withdrawal Confirmation"
                  description="Send confirmation when withdrawal is processed"
                />
                {withdrawalConfirmation && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">Template Preview:</p>
                    <div className="bg-background p-2 sm:p-3 rounded-md text-[10px] sm:text-xs text-muted-foreground break-words">
                      {templates.withdrawalConfirmation.substring(0, 100)}...
                    </div>
                  </div>
                )}
              </div>

              {/* Deposit Confirmation */}
              <div className="bg-muted/30 border border-border rounded-lg p-3 sm:p-4">
                <ToggleSwitch
                  enabled={depositConfirmation}
                  onChange={setDepositConfirmation}
                  label="Deposit Confirmation"
                  description="Send confirmation when deposit is received"
                />
                {depositConfirmation && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">Template Preview:</p>
                    <div className="bg-background p-2 sm:p-3 rounded-md text-[10px] sm:text-xs text-muted-foreground break-words">
                      {templates.depositConfirmation.substring(0, 100)}...
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border">
              <button
                onClick={() => handleSave("System Sends")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin shrink-0" /> : <Save size={14} className="sm:w-4 sm:h-4 shrink-0" />}
                <span>Save All Settings</span>
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm text-muted-foreground min-w-0 flex-1">
                <p className="font-medium text-foreground mb-1">Notification Channels</p>
                <p className="text-[10px] sm:text-xs break-words">Enable multiple channels to ensure customers receive important updates via their preferred method.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
