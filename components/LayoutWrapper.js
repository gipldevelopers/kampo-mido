"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import CustomerSidebar from "@/components/CustomerSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if the current page is an admin page
  const isAdminPage = pathname.startsWith("/admin");
  const isCustomerPage = pathname.startsWith("/customers");
  const isLoginPage = pathname === "/";

  // Return simple layout for Login (Root) page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Admin Layout
  if (isAdminPage) {
    return (
      <div className="flex min-h-screen bg-muted/20">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        {/* Sidebar - Hidden on mobile, shown as overlay when menu is open */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>
        <div className="flex-1 flex flex-col w-full md:w-auto min-w-0">
          <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // Customer Layout
  if (isCustomerPage) {
    return (
      <div className="flex min-h-screen bg-muted/20">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        {/* Sidebar - Hidden on mobile, shown as overlay when menu is open */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <CustomerSidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>
        <div className="flex-1 flex flex-col w-full md:w-auto min-w-0">
          <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // Default layout for other pages
  return <>{children}</>;
}