"use client";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function AddCustomer() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <button className="p-2 hover:bg-card border border-border rounded-full transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Add New Customer</h2>
          <p className="text-sm text-muted-foreground">Register a new user to the system manually.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">First Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                placeholder="Enter first name" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Last Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                placeholder="Enter last name" 
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mobile Number</label>
              <input 
                type="tel" 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                placeholder="+91 00000 00000" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                placeholder="user@example.com" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Address</label>
            <textarea 
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[100px]" 
              placeholder="Enter full address"
            ></textarea>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Initial Deposit (Optional)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                placeholder="0.00" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Account Status</label>
              <select className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/admin/customers">
              <button type="button" className="px-4 py-2 border border-input bg-transparent rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
            </Link>
            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
              <Save size={16} /> Save Customer
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}