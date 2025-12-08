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

// --- Template Preview Component ---
const TemplatePreview = ({ title, content, isEditing, onEdit, onSave, onCancel, onChange }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground">{title}</h4>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors"
            title="Edit Template"
          >
            <Edit size={16} />
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[200px] font-mono resize-y"
            placeholder="Enter template content..."
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-input bg-transparent rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Save size={16} /> Save Template
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-muted/30 p-4 rounded-md border border-border">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
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
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState("+91 98765 43210");
  
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
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Notification Management</h2>
          <p className="text-sm text-muted-foreground">Configure notification channels and system messages.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Admin Controls (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Weekly Statement Settings */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Weekly Statement Settings</h3>
            </div>
            
            <div className="space-y-4">
              <ToggleSwitch
                enabled={weeklyStatementEnabled}
                onChange={setWeeklyStatementEnabled}
                label="Enable Weekly Statements"
                description="Automatically send weekly account statements to customers"
              />
              
              {weeklyStatementEnabled && (
                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Day of Week</label>
                    <select
                      value={weeklyStatementDay}
                      onChange={(e) => setWeeklyStatementDay(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Time</label>
                    <input
                      type="time"
                      value={weeklyStatementTime}
                      onChange={(e) => setWeeklyStatementTime(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSave("Weekly Statement")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp API Configuration */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">WhatsApp API</h3>
            </div>
            
            <div className="space-y-4">
              <ToggleSwitch
                enabled={whatsappEnabled}
                onChange={setWhatsappEnabled}
                label="Enable WhatsApp Notifications"
                description="Send notifications via WhatsApp Business API"
              />
              
              {whatsappEnabled && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">API Key</label>
                    <input
                      type="text"
                      value={whatsappApiKey}
                      onChange={(e) => setWhatsappApiKey(e.target.value)}
                      placeholder="Enter WhatsApp API Key"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">API Secret</label>
                    <input
                      type="password"
                      value={whatsappApiSecret}
                      onChange={(e) => setWhatsappApiSecret(e.target.value)}
                      placeholder="Enter WhatsApp API Secret"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <input
                      type="text"
                      value={whatsappPhoneNumber}
                      onChange={(e) => setWhatsappPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSave("WhatsApp API")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* SMS API Configuration */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Smartphone size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">SMS API</h3>
            </div>
            
            <div className="space-y-4">
              <ToggleSwitch
                enabled={smsEnabled}
                onChange={setSmsEnabled}
                label="Enable SMS Notifications"
                description="Send notifications via SMS gateway"
              />
              
              {smsEnabled && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">API Key</label>
                    <input
                      type="text"
                      value={smsApiKey}
                      onChange={(e) => setSmsApiKey(e.target.value)}
                      placeholder="Enter SMS API Key"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">API Secret</label>
                    <input
                      type="password"
                      value={smsApiSecret}
                      onChange={(e) => setSmsApiSecret(e.target.value)}
                      placeholder="Enter SMS API Secret"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Sender ID</label>
                    <input
                      type="text"
                      value={smsSenderId}
                      onChange={(e) => setSmsSenderId(e.target.value)}
                      placeholder="KAMPOMD"
                      maxLength={6}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSave("SMS API")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Mail size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Email Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <ToggleSwitch
                enabled={emailEnabled}
                onChange={setEmailEnabled}
                label="Enable Email Notifications"
                description="Send notifications via SMTP email"
              />
              
              {emailEnabled && (
                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">SMTP Host</label>
                    <input
                      type="text"
                      value={emailSmtpHost}
                      onChange={(e) => setEmailSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">SMTP Port</label>
                    <input
                      type="text"
                      value={emailSmtpPort}
                      onChange={(e) => setEmailSmtpPort(e.target.value)}
                      placeholder="587"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Username</label>
                    <input
                      type="email"
                      value={emailUsername}
                      onChange={(e) => setEmailUsername(e.target.value)}
                      placeholder="noreply@kampomido.com"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <input
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Enter SMTP password"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleSave("Email Configuration")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <FileText size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Email Templates</h3>
            </div>
            
            <div className="space-y-4">
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
        <div className="space-y-6">
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Bell size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">System Sends</h3>
            </div>
            
            <div className="space-y-4">
              {/* Weekly Gold Value Update */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <ToggleSwitch
                  enabled={weeklyGoldUpdate}
                  onChange={setWeeklyGoldUpdate}
                  label="Weekly Gold Value Update"
                  description="Send weekly gold value updates to customers"
                />
                {weeklyGoldUpdate && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Template Preview:</p>
                    <div className="bg-background p-3 rounded-md text-xs text-muted-foreground">
                      {templates.weeklyGoldUpdate.substring(0, 100)}...
                    </div>
                  </div>
                )}
              </div>

              {/* KYC Approval Message */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <ToggleSwitch
                  enabled={kycApproval}
                  onChange={setKycApproval}
                  label="KYC Approval Message"
                  description="Notify customers when KYC is approved"
                />
                {kycApproval && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Template Preview:</p>
                    <div className="bg-background p-3 rounded-md text-xs text-muted-foreground">
                      {templates.kycApproval.substring(0, 100)}...
                    </div>
                  </div>
                )}
              </div>

              {/* Withdrawal Confirmation */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <ToggleSwitch
                  enabled={withdrawalConfirmation}
                  onChange={setWithdrawalConfirmation}
                  label="Withdrawal Confirmation"
                  description="Send confirmation when withdrawal is processed"
                />
                {withdrawalConfirmation && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Template Preview:</p>
                    <div className="bg-background p-3 rounded-md text-xs text-muted-foreground">
                      {templates.withdrawalConfirmation.substring(0, 100)}...
                    </div>
                  </div>
                )}
              </div>

              {/* Deposit Confirmation */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <ToggleSwitch
                  enabled={depositConfirmation}
                  onChange={setDepositConfirmation}
                  label="Deposit Confirmation"
                  description="Send confirmation when deposit is received"
                />
                {depositConfirmation && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Template Preview:</p>
                    <div className="bg-background p-3 rounded-md text-xs text-muted-foreground">
                      {templates.depositConfirmation.substring(0, 100)}...
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <button
                onClick={() => handleSave("System Sends")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save All Settings
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Notification Channels</p>
                <p className="text-xs">Enable multiple channels to ensure customers receive important updates via their preferred method.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
