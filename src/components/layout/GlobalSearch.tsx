import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Activity,
  FileText,
  PieChart,
  BarChart3,
  Building2,
  Coins,
  Receipt,
  Users,
  Shield,
  Upload,
  User,
  PlusCircle,
  Download,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navigation" | "Action" | "Scheme" | "Client / Investor";
  icon: React.ElementType;
  href: string;
  superAdminOnly?: boolean;
}

const SEARCH_ITEMS: SearchItem[] = [
  // Navigation
  { id: "nav-dash", title: "Main Dashboard", subtitle: "KPIs, Net Worth & Portfolio Allocation", category: "Navigation", icon: LayoutDashboard, href: "/" },
  { id: "nav-port", title: "Portfolio Overview", subtitle: "Consolidated multi-asset summary", category: "Navigation", icon: Briefcase, href: "/portfolio" },
  { id: "nav-ana", title: "Portfolio Analysis", subtitle: "Asset allocation, XIRR and asset mix", category: "Navigation", icon: Activity, href: "/portfolio-analysis" },
  { id: "nav-mf", title: "Mutual Funds", subtitle: "Scheme holdings, units & latest NAV", category: "Navigation", icon: TrendingUp, href: "/mutual-funds" },
  { id: "nav-pnl", title: "Profit & Loss Statement", subtitle: "Realized and unrealized returns", category: "Navigation", icon: PieChart, href: "/pnl" },
  { id: "nav-cg", title: "Capital Gains Tax", subtitle: "FIFO short-term & long-term tax insights", category: "Navigation", icon: BarChart3, href: "/capital-gains" },
  { id: "nav-txn", title: "Transactions Ledger", subtitle: "Complete history of purchases & redemptions", category: "Navigation", icon: Receipt, href: "/transactions" },
  { id: "nav-rep", title: "Transaction Reports", subtitle: "Export consolidated client statements", category: "Navigation", icon: FileText, href: "/transaction-reports" },
  { id: "nav-re", title: "Real Estate Holdings", subtitle: "Commercial & residential properties", category: "Navigation", icon: Building2, href: "/real-estate" },
  { id: "nav-gold", title: "Gold & Bullion", subtitle: "Physical gold & sovereign bonds", category: "Navigation", icon: Coins, href: "/gold" },

  // Admin Navigation
  { id: "adm-usr", title: "User Accounts", subtitle: "Manage user roles and credentials", category: "Navigation", icon: Users, href: "/users", superAdminOnly: true },
  { id: "adm-rol", title: "Roles & Permissions", subtitle: "Role hierarchy & authorization rules", category: "Navigation", icon: Shield, href: "/roles", superAdminOnly: true },
  { id: "adm-inv", title: "Investor Directory", subtitle: "Client profiles & KYC verification", category: "Navigation", icon: User, href: "/investors", superAdminOnly: true },
  { id: "adm-upld", title: "Data Importer", subtitle: "Batch import transaction workbooks & CAS", category: "Navigation", icon: Upload, href: "/data-upload", superAdminOnly: true },

  // Quick Actions
  { id: "act-inv", title: "Add Investment", subtitle: "Execute purchase, switch, or redemption", category: "Action", icon: PlusCircle, href: "/online-transactions" },
  { id: "act-stmt", title: "Download Account Statement", subtitle: "Export PDF / Excel client transaction reports", category: "Action", icon: Download, href: "/transactions" },
  { id: "act-cg", title: "Calculate Capital Gains", subtitle: "Compute STCG / LTCG with FY tax rules", category: "Action", icon: Sparkles, href: "/capital-gains" },
  { id: "act-upld", title: "Upload CAS / Transaction File", subtitle: "Batch import investor transaction data", category: "Action", icon: Upload, href: "/data-upload", superAdminOnly: true },

  // Key Schemes
  { id: "sch-1", title: "HDFC Flexi Cap Fund", subtitle: "Equity • Current NAV ₹1,698.40", category: "Scheme", icon: TrendingUp, href: "/mutual-funds" },
  { id: "sch-2", title: "SBI Bluechip Fund", subtitle: "Large Cap • Current NAV ₹89.24", category: "Scheme", icon: TrendingUp, href: "/mutual-funds" },
  { id: "sch-3", title: "Parag Parikh Flexi Cap Fund", subtitle: "Multi Cap • Current NAV ₹78.40", category: "Scheme", icon: TrendingUp, href: "/mutual-funds" },
  { id: "sch-4", title: "ICICI Prudential Bluechip Fund", subtitle: "Large Cap • Current NAV ₹104.50", category: "Scheme", icon: TrendingUp, href: "/mutual-funds" },
  { id: "sch-5", title: "Nippon India Small Cap Fund", subtitle: "Small Cap • Current NAV ₹145.20", category: "Scheme", icon: TrendingUp, href: "/mutual-funds" },
  { id: "sch-6", title: "Kotak Emerging Equity Fund", subtitle: "Mid Cap • Current NAV ₹112.80", category: "Scheme", icon: TrendingUp, href: "/mutual-funds" },

  // Clients / Investors
  { id: "inv-1", title: "Rajesh Babu", subtitle: "PAN: ABCPR1234D • 12 Active Schemes", category: "Client / Investor", icon: User, href: "/investors", superAdminOnly: true },
  { id: "inv-2", title: "Dileep Kumar T S", subtitle: "PAN: BKPKD5678E • 8 Active Schemes", category: "Client / Investor", icon: User, href: "/investors", superAdminOnly: true },
  { id: "inv-3", title: "Ananya Sharma", subtitle: "PAN: CHKPS9876M • 5 Active Schemes", category: "Client / Investor", icon: User, href: "/investors", superAdminOnly: true },
];

export const GlobalSearch = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  // Filter items by role and query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const available = SEARCH_ITEMS.filter((item) => !item.superAdminOnly || isSuperAdmin);

    if (!q) {
      return available.slice(0, 10);
    }

    return available.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, isSuperAdmin]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSelect = useCallback(
    (item: SearchItem) => {
      onOpenChange(false);
      setQuery("");
      navigate(item.href);
    },
    [navigate, onOpenChange]
  );

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>Global Search</DialogTitle>
        </DialogHeader>

        {/* Search input header */}
        <div className="flex items-center px-4 border-b border-border/60 bg-muted/30">
          <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search schemes, investors, reports, actions... (↑↓ to navigate)"
            className="h-13 border-none bg-transparent shadow-none text-sm placeholder:text-muted-foreground focus-visible:ring-0 px-0"
            autoFocus
          />
          <Badge
            variant="outline"
            className="text-[10px] font-mono font-bold text-muted-foreground/80 border-border bg-background px-1.5 py-0.5 rounded ml-2"
          >
            ESC
          </Badge>
        </div>

        {/* Results container */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">No matching results found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for "Mutual Funds", "Capital Gains", or client names.
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              const badgeColor =
                item.category === "Action"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : item.category === "Scheme"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : item.category === "Client / Investor"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400";

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 group",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/70 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Badge
                      variant="secondary"
                      className={cn("text-[9px] font-bold px-1.5 py-0 rounded border-none", badgeColor)}
                    >
                      {item.category}
                    </Badge>
                    <ArrowRight
                      className={cn(
                        "h-3.5 w-3.5 transition-opacity",
                        isSelected ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border/50 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">↓</kbd>
            <span>Select:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">↵</kbd>
          </div>
          <span>BrickWealth Omnisearch</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
