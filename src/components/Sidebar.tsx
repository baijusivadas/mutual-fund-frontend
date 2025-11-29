import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  ArrowLeftRight,
  FileText,
  TrendingUp,
  PieChart,
  TrendingDown,
  Landmark,
  TableProperties,
  Users,
  Building2,
  Coins,
  Home,
  KeyRound,
  ChevronDown,
  BarChart3,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

/* ------------------------- Static Navigation Items ------------------------ */

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Mutual Funds", href: "/mutual-funds", icon: Landmark },
  { name: "Derivatives", href: "/derivatives", icon: TrendingDown },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  {
    name: "Transaction Reports",
    href: "/transaction-reports",
    icon: TableProperties,
  },
  { name: "P&L Report", href: "/pnl", icon: TrendingUp },
  { name: "Capital Gains", href: "/capital-gains", icon: PieChart },
  { name: "Stock Reports", href: "/stock-reports", icon: FileText },
];

/* --------------------------- Super Admin Menu ----------------------------- */

const adminMenu = [
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Real Estate", href: "/admin/real-estate", icon: Building2 },
  { label: "Gold", href: "/admin/gold", icon: Coins },
  { label: "Flats", href: "/admin/flats", icon: Home },
  { label: "Rental Properties", href: "/admin/rental-properties", icon: KeyRound },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Notification History", href: "/admin/notifications", icon: Bell }, // <-- ADDED HERE
];

const adminPaths = adminMenu.map((item) => item.href);

/* ------------------------------- Component ------------------------------- */

export const Sidebar = () => {
  const { isSuperAdmin } = useAuth();
  const location = useLocation();

  const isAdminActive = adminPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  const [openAdmin, setOpenAdmin] = useState(isAdminActive);

  useEffect(() => {
    if (isAdminActive) setOpenAdmin(true);
  }, [location.pathname]);

  const navLinkClasses = ({ isActive }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card overflow-y-auto">

      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">FinSight</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className={navLinkClasses}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}

        {/* Super Admin */}
        {isSuperAdmin && (
          <>
            <div className="my-2 border-t" />

            <button
              onClick={() => setOpenAdmin((prev) => !prev)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground"
            >
              <span className="text-base">Super Admin</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  openAdmin && "rotate-180"
                )}
              />
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 pl-4",
                openAdmin ? "max-h-96" : "max-h-0"
              )}
            >
              <div className="space-y-1">
                {adminMenu.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={navLinkClasses}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Market Status</p>
          <p className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
            Market Open
          </p>
        </div>
      </div>
    </div>
  );
};
