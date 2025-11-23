import { NavLink } from "react-router-dom";
import { LayoutDashboard, Briefcase, ArrowLeftRight, FileText, TrendingUp, PieChart, TrendingDown, Landmark, TableProperties, Users, Building2, Coins, Home, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Mutual Funds", href: "/mutual-funds", icon: Landmark },
  { name: "Derivatives", href: "/derivatives", icon: TrendingDown },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Transaction Reports", href: "/transaction-reports", icon: TableProperties },
  { name: "P&L Report", href: "/pnl", icon: TrendingUp },
  { name: "Capital Gains", href: "/capital-gains", icon: PieChart },
  { name: "Stock Reports", href: "/stock-reports", icon: FileText },
];

export const Sidebar = () => {
  const { isSuperAdmin } = useAuth();
  
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">FinSight</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
        
        {isSuperAdmin && (
          <>
            <div className="my-2 border-t" />
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground">Super Admin</p>
            </div>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Users className="h-5 w-5" />
              User Management
            </NavLink>
            <NavLink
              to="/admin/real-estate"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Building2 className="h-5 w-5" />
              Real Estate
            </NavLink>
            <NavLink
              to="/admin/gold"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Coins className="h-5 w-5" />
              Gold
            </NavLink>
            <NavLink
              to="/admin/flats"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Home className="h-5 w-5" />
              Flats
            </NavLink>
            <NavLink
              to="/admin/rental-properties"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <KeyRound className="h-5 w-5" />
              Rental Properties
            </NavLink>
          </>
        )}
      </nav>
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