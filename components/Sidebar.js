"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Coins,
  CheckCircle2,
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  Bell,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X
} from "lucide-react";
import { clsx } from "clsx";
import { useUser } from "@/context/UserContext";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Customer Management", href: "/admin/customers", icon: Users },
  { name: "KYC Management", href: "/admin/kyc", icon: ShieldCheck },
  { name: "Gold Rate", href: "/admin/gold-rate", icon: Coins },
  { name: "Approve deposits", href: "/admin/approve-deposits", icon: CheckCircle2 },
  { name: "Deposits", href: "/admin/deposits", icon: ArrowDownCircle },
  { name: "Withdrawals", href: "/admin/withdrawals", icon: ArrowUpCircle },
  { name: "Ledger & Reports", href: "/admin/ledger", icon: BookOpen },
  { name: "Notifications", href: "/admin/notification", icon: Bell },
  { name: "Admin Profile", href: "/admin/profile", icon: UserCircle },
];

export default function Sidebar({ onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside
      className={clsx(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-[width] duration-300 ease-in-out md:sticky top-0 z-30 overflow-hidden shadow-lg md:shadow-none",
        "w-64",
        isCollapsed && "md:w-16"
      )}
    >
      {/* --- Sidebar Header --- */}
      <div className={clsx(
        "border-b border-sidebar-border whitespace-nowrap transition-all duration-300",
        isCollapsed ? "py-3" : "h-14 md:h-16"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-3 h-full">
            {/* Logo Area - Expanded */}
            <div className="flex items-center gap-2 overflow-hidden transition-all duration-300 w-44 opacity-100">
              <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 overflow-hidden rounded-md border border-sidebar-border/50">
                <Image
                  src="/logo/logo.jpeg"
                  alt="Kampo Mido Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-bold text-sm md:text-base text-sidebar-foreground tracking-tight whitespace-nowrap">
                Kampo Mido
              </span>
            </div>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors shrink-0"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            )}

            {/* Desktop Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center gap-2 px-0">
            {/* Logo Area - Collapsed */}
            <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-md border border-sidebar-border/50">
              <Image
                src="/logo/logo.jpeg"
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
            {/* Desktop Toggle Button - Collapsed */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors shrink-0"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* --- Menu Items --- */}
      <div className={clsx(
        "flex-1 overflow-y-auto py-4 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-muted overflow-x-hidden",
        isCollapsed ? "px-2" : "px-2"
      )}>
        {menuItems.map((item) => {
          const isActive = item.href === "/admin/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const handleClick = () => {
            // Close sidebar on mobile when menu item is clicked
            if (onClose) {
              onClose();
            }
          };

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClick}
              className={clsx(
                "flex items-center rounded-md transition-all group whitespace-nowrap relative overflow-hidden",
                isCollapsed
                  ? "justify-center px-2 py-2.5"
                  : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={isCollapsed ? item.name : ""}
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* --- Footer / Logout --- */}
      <div className={clsx(
        "border-t border-sidebar-border bg-sidebar overflow-hidden",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <button
          onClick={handleLogout}
          className={clsx(
            "flex items-center py-2 rounded-md text-destructive hover:bg-destructive/10 transition-all w-full whitespace-nowrap",
            isCollapsed ? "justify-center px-2" : "gap-3 px-3"
          )}>
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium transition-all duration-300 ease-in-out">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}