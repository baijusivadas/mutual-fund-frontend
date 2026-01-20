import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebarItems } from "@/hooks/useSidebarItems";
import * as LucideIcons from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard: LucideIcons.LayoutDashboard,
  Briefcase: LucideIcons.Briefcase,
  ArrowLeftRight: LucideIcons.ArrowLeftRight,
  FileText: LucideIcons.FileText,
  TrendingUp: LucideIcons.TrendingUp,
  PieChart: LucideIcons.PieChart,
  TrendingDown: LucideIcons.TrendingDown,
  Landmark: LucideIcons.Landmark,
  TableProperties: LucideIcons.TableProperties,
  Users: LucideIcons.Users,
  Building2: LucideIcons.Building2,
  Coins: LucideIcons.Coins,
  Home: LucideIcons.Home,
  KeyRound: LucideIcons.KeyRound,
  BarChart3: LucideIcons.BarChart3,
  Bell: LucideIcons.Bell,
  Shield: LucideIcons.Shield,
  Settings: LucideIcons.Settings,
  Folder: LucideIcons.Folder,
  FolderTree: LucideIcons.FolderTree,
  Upload: LucideIcons.Upload,
  Link2: LucideIcons.Link2,
};

export const DynamicSidebar = () => {
  const { data: sidebarItems, isLoading, isFetching } = useSidebarItems();
  const { role } = useAuth();

  // Use placeholder data immediately - no loading skeleton needed
  const items = sidebarItems || [];

  // Separate admin items (those with /admin/ in href)
  const regularItems = items.filter(item => !item.href.includes('/admin/'));
  const adminItems = items.filter(item => item.href.includes('/admin/'));

  const renderNavItem = (item: { id: string; name: string; href: string; icon: string }) => {
    const IconComponent = iconMap[item.icon] || LucideIcons.Circle;

    return (
      <NavLink
        key={item.id}
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
        <IconComponent className="h-5 w-5" />
        {item.name}
      </NavLink>
    );
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">TradePro</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {/* Regular navigation items - render immediately */}
        {regularItems.map(renderNavItem)}
        
        {/* Admin section */}
        {adminItems.length > 0 && (
          <>
            <div className="my-2 border-t" />
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Administration</p>
            </div>
            {adminItems.map(renderNavItem)}
          </>
        )}
      </nav>
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Role: {role || 'Loading...'}</p>
          <p className="mt-1 flex items-center gap-2">
            <span className={cn(
              "h-2 w-2 rounded-full",
              isFetching ? "bg-yellow-500" : "bg-success animate-pulse"
            )}></span>
            {isFetching ? "Syncing..." : "Market Open"}
          </p>
        </div>
      </div>
    </div>
  );
};