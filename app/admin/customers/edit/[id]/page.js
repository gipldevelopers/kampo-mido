"use client";
import { useState, use } from "react"; // Import 'use' to unwrap params
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import Toast from "@/components/Toast"; // Import your Toast component

export default function EditCustomer({ params }) {
  // FIX: Unwrap the params Promise using React.use()
  const { id } = use(params);
  
  // State for Toast
  const [toast, setToast] = useState(null);

  const handleUpdate = (e) => {
    e.preventDefault();
    // Simulate API update logic here...
    
    // Show Success Toast
    setToast({ message: "Customer updated successfully!", type: "success" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full relative">
      
      {/* Toast Notification Container */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <button className="p-2 hover:bg-card border border-border rounded-full transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Customer</h2>
          <p className="text-sm text-muted-foreground">Update details for Customer ID: {id}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <input 
                type="text" 
                defaultValue="Rahul" 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <input 
                type="text" 
                defaultValue="Sharma" 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mobile Number</label>
              <input 
                type="tel" 
                defaultValue="+91 98765 43210" 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input 
                type="email" 
                defaultValue="rahul.sharma@example.com" 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Address</label>
            <textarea 
              defaultValue="123, Market Road, Ahmedabad, Gujarat" 
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[100px]"
            ></textarea>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">KYC Status</label>
              <select 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                defaultValue="Verified"
              >
                <option>Verified</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Account Status</label>
              <select 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                defaultValue="Active"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/admin/customers">
              <button type="button" className="px-4 py-2 border border-input bg-transparent rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
            </Link>
            <button 
              type="submit" 
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <Save size={16} /> Update Customer
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}