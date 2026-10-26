import { useState, useMemo,useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { InvestorSelector } from "./InvestorSelector";
import { NotificationBell } from "../shared/NotificationBell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  TrendingUp,
  LayoutDashboard,
  Building2,
  Coins,
  Home,
  KeyRound,
  Briefcase,
  Layers,
  Activity,
  TrendingDown,
  ArrowLeftRight,
  Receipt,
  FileText,
  PieChart,
  BarChart3,
  TableProperties,
  Shield,
  Users,
  Upload,
  Link2,
  Database,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
  Menu,
  Sparkles,
} from "lucide-react";

export const Topbar = () => {
  const { user, role, signOut, isSuperAdmin } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme || theme) === "dark" : true;

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Group definitions
  const navSections = useMemo(
    () => [
      {
        id: "portfolio",
        label: "Portfolio",
        icon: Briefcase,
        routes: [
          { href: "/portfolio", label: "Portfolio Overview", icon: Briefcase, desc: "Asset overview & allocation" },
          { href: "/portfolio-analysis", label: "Portfolio Analysis", icon: Activity, desc: "Detailed breakdown, XIRR & asset mix" },
          { href: "/mutual-funds", label: "Mutual Funds", icon: TrendingUp, desc: "Scheme holdings & NAV" },
          { href: "/derivatives", label: "Derivatives", icon: ArrowLeftRight, desc: "F&O positions & strategies" },
          { href: "/other-investments", label: "Other Investments", icon: Coins, desc: "Alternative financial assets" },
          { href: "/other-assets", label: "Other Assets", icon: Layers, desc: "Tangible & fixed investments" },
          { href: "/liabilities", label: "Liabilities", icon: TrendingDown, desc: "Loans & credit balances" },
        ],
      },
      {
        id: "assets",
        label: "Assets",
        icon: Building2,
        superAdminOnly: true,
        routes: [
          { href: "/admin/real-estate", label: "Real Estate", icon: Building2, desc: "Commercial & residential land" },
          { href: "/admin/gold", label: "Gold Holdings", icon: Coins, desc: "Physical & digital bullion" },
          { href: "/admin/flats", label: "Flats & Units", icon: Home, desc: "Residential properties" },
          { href: "/admin/rental-properties", label: "Rental Yields", icon: KeyRound, desc: "Tenancy & rental revenue" },
        ],
      },
      {
        id: "insights",
        label: "Insights",
        icon: BarChart3,
        routes: [
          { href: "/transactions", label: "Transactions", icon: Receipt, desc: "Complete trade ledgers" },
          { href: "/transaction-reports", label: "Transaction Reports", icon: FileText, desc: "Consolidated statement exports" },
          { href: "/pnl", label: "Profit & Loss", icon: PieChart, desc: "Realized & unrealized returns" },
          { href: "/capital-gains", label: "Capital Gains", icon: BarChart3, desc: "Short & long-term tax insights" },
          { href: "/stock-reports", label: "Stock Reports", icon: TableProperties, desc: "Equity performance metrics" },
          { href: "/admin/analytics", label: "Analytics Suite", icon: BarChart3, desc: "Deep portfolio intelligence", superAdminOnly: true },
        ],
      },
      {
        id: "admin",
        label: "System",
        icon: Shield,
        superAdminOnly: true,
        routes: [
          { href: "/admin/users", label: "User Accounts", icon: Users, desc: "Role-based account controls" },
          { href: "/admin/roles", label: "Roles & Permissions", icon: Shield, desc: "System authorization trees" },
          { href: "/admin/investors", label: "Investors Directory", icon: User, desc: "KYC & mapped folios" },
          { href: "/admin/data-upload", label: "Data Importer", icon: Upload, desc: "CAS & workbook batch sync" },
          { href: "/admin/user-investment-mapping", label: "Portfolio Mappings", icon: Link2, desc: "Assign investors to users" },
          { href: "/admin/master-data", label: "Master Data", icon: Database, desc: "Schemes & asset reference tables" },
          { href: "/admin/notifications", label: "Audit Notifications", icon: Bell, desc: "System alerts & activity logs" },
        ],
      },
    ],
    []
  );

  const isSectionActive = (routes: { href: string }[]) => {
    return routes.some((r) => location.pathname === r.href || location.pathname.startsWith(`${r.href}/`));
  };

  const handleMobileNav = (href: string) => {
    navigate(href);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-2xl transition-colors duration-200 shadow-sm relative">
      {/* Top Card Gradient Glow Edge */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/80 to-transparent opacity-80 pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Brand + Navigation Links */}
          <div className="flex items-center gap-6 lg:gap-8 min-w-0">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-foreground">
                  BrickWealth
                </span>
              </div>
            </Link>

            {/* Desktop Horizontal Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Direct Dashboard Link */}
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </NavLink>

              {/* Categorized Dropdowns */}
              {navSections
                .filter((section) => !section.superAdminOnly || isSuperAdmin)
                .map((section) => {
                  const active = isSectionActive(section.routes);
                  const Icon = section.icon;

                  // Filter visible routes based on role
                  const visibleRoutes = section.routes.filter(
                    (r) => !("superAdminOnly" in r && r.superAdminOnly) || isSuperAdmin
                  );

                  return (
                    <DropdownMenu key={section.id}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-all",
                            active
                              ? "bg-muted text-foreground border border-border/60 shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span>{section.label}</span>
                          <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        sideOffset={8}
                        className="w-72 p-2 rounded-2xl glass-card border border-border/60 shadow-2xl backdrop-blur-2xl"
                      >
                        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                          {section.label}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-1" />
                        <div className="grid gap-1">
                          {visibleRoutes.map((route) => {
                            const isCurrent = location.pathname === route.href;
                            const RouteIcon = route.icon;

                            return (
                              <DropdownMenuItem
                                key={route.href}
                                asChild
                                className={cn(
                                  "rounded-xl cursor-pointer p-2.5 transition-colors focus:bg-muted/80",
                                  isCurrent && "bg-primary/10 text-primary font-medium"
                                )}
                              >
                                <Link to={route.href} className="flex items-start gap-3">
                                  <div
                                    className={cn(
                                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                      isCurrent
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground/70"
                                    )}
                                  >
                                    <RouteIcon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={cn(
                                        "text-xs font-semibold leading-tight truncate",
                                        isCurrent ? "text-primary" : "text-foreground"
                                      )}
                                    >
                                      {route.label}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground truncate leading-snug mt-0.5">
                                      {route.desc}
                                    </div>
                                  </div>
                                </Link>
                              </DropdownMenuItem>
                            );
                          })}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })}
            </nav>
          </div>

          {/* Right: Actions, Filters, Theme, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Investor Selector (SuperAdmin Only) */}
            {isSuperAdmin && (
              <div className="hidden md:block">
                <InvestorSelector />
              </div>
            )}

            {isSuperAdmin && (
              <Separator orientation="vertical" className="h-5 mx-0.5 hidden md:block" />
            )}

            {/* Theme Switcher */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-muted/80 transition-transform active:scale-95 text-foreground"
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
              )}
            </Button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-xl bg-muted/60 border border-border/50 p-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
                >
                  <User className="h-4 w-4 text-foreground/80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 glass-card rounded-2xl shadow-2xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5 p-2">
                    <p className="text-sm font-semibold leading-none truncate text-foreground">
                      {user?.name || user?.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <div className="pt-1">
                      <Badge
                        variant={isSuperAdmin ? "default" : "secondary"}
                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md"
                      >
                        {role || "user"}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isSuperAdmin && (
                  <>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/admin/users" className="flex items-center gap-2 text-xs">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Manage Users</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/admin/data-upload" className="flex items-center gap-2 text-xs">
                        <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Upload Data / CAS</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem
                  className="cursor-pointer rounded-xl focus:bg-destructive/10 focus:text-destructive text-destructive font-medium text-xs"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Drawer Toggle */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-xl hover:bg-muted">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 bg-background/95 backdrop-blur-2xl border-l">
                <SheetHeader className="p-5 border-b border-border/50 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <SheetTitle className="text-base font-bold">BrickWealth</SheetTitle>
                      <span className="text-xs text-muted-foreground">Portfolio Navigation</span>
                    </div>
                  </div>
                </SheetHeader>

                <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)] space-y-6">
                  {/* Mobile Investor Selector */}
                  {isSuperAdmin && (
                    <div className="space-y-1.5 pb-2 border-b border-border/40">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Viewing Investor
                      </span>
                      <InvestorSelector />
                    </div>
                  )}

                  {/* Dashboard link */}
                  <div>
                    <Button
                      variant={location.pathname === "/" ? "default" : "ghost"}
                      className="w-full justify-start text-xs font-semibold rounded-xl gap-2.5"
                      onClick={() => handleMobileNav("/")}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </div>

                  {/* Sections */}
                  {navSections
                    .filter((s) => !s.superAdminOnly || isSuperAdmin)
                    .map((section) => (
                      <div key={section.id} className="space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                          {section.label}
                        </div>
                        <div className="space-y-0.5">
                          {section.routes
                            .filter((r) => !("superAdminOnly" in r && r.superAdminOnly) || isSuperAdmin)
                            .map((route) => {
                              const isCurrent = location.pathname === route.href;
                              const RouteIcon = route.icon;

                              return (
                                <Button
                                  key={route.href}
                                  variant={isCurrent ? "secondary" : "ghost"}
                                  className={cn(
                                    "w-full justify-start text-xs font-medium rounded-xl gap-2.5",
                                    isCurrent && "font-semibold text-primary bg-primary/10"
                                  )}
                                  onClick={() => handleMobileNav(route.href)}
                                >
                                  <RouteIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span className="truncate">{route.label}</span>
                                </Button>
                              );
                            })}
                        </div>
                      </div>
                    ))}

                  <div className="pt-4 border-t border-border/50">
                    <Button
                      variant="destructive"
                      className="w-full rounded-xl gap-2 text-xs"
                      onClick={() => {
                        setMobileOpen(false);
                        signOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
