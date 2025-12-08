"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import CustomerSidebar from "@/components/CustomerSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
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
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 overflow-auto">
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
        <CustomerSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 overflow-auto">
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