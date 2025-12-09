"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet,
  ArrowDownCircle, 
  ArrowUpCircle, 
  FileText,
  ShieldCheck,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Gem,
  X
} from "lucide-react";
import { clsx } from "clsx";
import { useUser } from "@/context/UserContext";

const menuItems = [
  { name: "Dashboard", href: "/customers/dashboard", icon: LayoutDashboard },
  { name: "Deposit", href: "/customers/deposit-page", icon: ArrowDownCircle },
  { name: "Withdrawals", href: "/customers/withdrawals", icon: ArrowUpCircle },
  { name: "Wallet", href: "/customers/wallet-page", icon: Wallet },
  { name: "Statements", href: "/customers/statements", icon: FileText },
  { name: "KYC", href: "/customers/kyc-page", icon: ShieldCheck },
  { name: "Profile", href: "/customers/profile-page", icon: UserCircle },
];

export default function CustomerSidebar({ onClose }) {
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
        "w-64 md:w-64",
        isCollapsed && "md:w-16"
      )}
    >
      {/* --- Sidebar Header --- */}
      <div className={clsx(
        "h-14 md:h-16 flex items-center border-b border-sidebar-border whitespace-nowrap px-3 transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        
        {/* Logo / Name Area */}
        <div className={clsx(
          "flex items-center gap-2 overflow-hidden transition-all duration-300",
          isCollapsed ? "w-0 opacity-0" : "w-40 opacity-100"
        )}>
          <div className="bg-primary/10 p-1.5 rounded-md shrink-0 text-primary">
            <Gem size={20} />
          </div>
          <span className="font-bold text-base md:text-lg text-sidebar-foreground tracking-tight whitespace-nowrap">
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
          className="hidden md:block p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* --- Menu Items --- */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2 scrollbar-thin scrollbar-thumb-muted overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = item.href === "/customers/dashboard" 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group whitespace-nowrap relative overflow-hidden",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={isCollapsed ? item.name : ""}
            >
              <item.icon size={20} className="shrink-0" />
              <span 
                className={clsx(
                  "text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0 translate-x-2" : "w-auto opacity-100 translate-x-0"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* --- Footer / Logout --- */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar overflow-hidden">
         <button 
            onClick={handleLogout}
            className={clsx(
            "flex items-center gap-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-all w-full whitespace-nowrap",
             isCollapsed ? "justify-center px-0" : "px-3"
          )}>
            <LogOut size={20} className="shrink-0" />
            <span className={clsx(
              "text-sm font-medium transition-all duration-300 ease-in-out",
              isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
            )}>
              Logout
            </span>
         </button>
      </div>
    </aside>
  );
}

