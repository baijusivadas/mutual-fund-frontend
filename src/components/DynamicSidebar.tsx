import { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebarItems, SidebarItem } from "@/hooks/useSidebarItems";
import * as LucideIcons from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PanelLeft } from "lucide-react";

// Icon mapping for individual items
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const [openCategory, setOpenCategory] = useState<string | undefined>(undefined);

  // Define sidebar categories
  const categories = useMemo(() => [
    {
      id: "asset_mgmt",
      name: "Asset Management",
      icon: LucideIcons.Building2,
      routes: ["/admin/real-estate", "/admin/gold", "/admin/flats", "/admin/rental-properties"]
    },
    {
      id: "inv_mgmt",
      name: "Investment Management",
      icon: LucideIcons.Briefcase,
      routes: ["/portfolio", "/mutual-funds", "/derivatives", "/other-investments", "/other-assets", "/liabilities"]
    },
    {
      id: "reports_analytics",
      name: "Reports & Analytics",
      icon: LucideIcons.BarChart3,
      routes: ["/transactions", "/transaction-reports", "/pnl", "/capital-gains", "/stock-reports", "/admin/analytics"]
    },
    {
      id: "admin",
      name: "Administration",
      icon: LucideIcons.Shield,
      routes: ["/admin/users", "/admin/roles", "/admin/data-upload", "/admin/user-investment-mapping", "/admin/notifications"]
    }
  ], []);

  // Categorize items into the defined categories
  const categorizedMenu = useMemo(() => {
    if (!sidebarItems) return { main: [], accordion: [] };
    
    // Dashboard is usually a top-level "Main" item
    const dashboard = sidebarItems.find(item => item.href === "/");
    const mainItems = dashboard ? [dashboard] : [];
    
    const accordionGroups = categories.map(cat => ({
      ...cat,
      children: sidebarItems.filter(item => cat.routes.includes(item.href))
    })).filter(group => group.children.length > 0);

    // Also identify items that didn't fit into any category (excluding dashboard)
    const categorizedHrefs = [
      "/",
      ...categories.flatMap(cat => cat.routes)
    ];
    const otherItems = sidebarItems.filter(item => !categorizedHrefs.includes(item.href));
    
    if (otherItems.length > 0) {
      accordionGroups.push({
        id: "other",
        name: "Other",
        icon: LucideIcons.MoreHorizontal,
        routes: [],
        children: otherItems
      });
    }

    return { main: mainItems, accordion: accordionGroups };
  }, [sidebarItems, categories]);

  // Handle auto-opening of the category containing the active route
  useEffect(() => {
    const activeGroup = categorizedMenu.accordion.find(group => 
      group.children.some(child => child.href === location.pathname)
    );
    if (activeGroup) {
      setOpenCategory(activeGroup.id);
    }
  }, [location.pathname, categorizedMenu.accordion]);

  const renderNavItem = (item: SidebarItem) => {
    const IconComponent = iconMap[item.icon] || LucideIcons.Circle;

    return (
      <NavLink
        key={item.id}
        to={item.href}
        end={item.href === "/"}
        title={isCollapsed ? item.name : undefined}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isCollapsed && "justify-center px-2",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )
        }
      >
        <IconComponent className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span className="truncate">{item.name}</span>}
      </NavLink>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-2 px-3 py-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <div className="h-5 w-5 rounded bg-muted animate-pulse" />
          {!isCollapsed && <div className="h-4 w-24 rounded bg-muted animate-pulse" />}
        </div>
      ))}
    </div>
  );

  return (
    <div 
      className={cn(
        "flex h-screen flex-col border-r bg-card transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
        "flex h-16 items-center border-b px-4 transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && <h1 className="text-xl font-bold text-primary truncate">TradePro</h1>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {isLoading ? (
        renderSkeleton()
      ) : (
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto no-scrollbar">
          {/* Main Items (e.g., Dashboard) */}
          {categorizedMenu.main.map(renderNavItem)}

          <Accordion 
            type="single" 
            collapsible 
            value={openCategory}
            onValueChange={setOpenCategory}
            className="space-y-1"
          >
            {categorizedMenu.accordion.map((group) => {
              const CategoryIcon = group.icon;
              
              if (isCollapsed) {
                return (
                  <div key={group.id} className="space-y-1 pt-2 border-t mt-2">
                    {group.children.map(renderNavItem)}
                  </div>
                );
              }

              return (
                <AccordionItem key={group.id} value={group.id} className="border-none">
                  <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground group">
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{group.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pl-4 space-y-1">
                    {group.children.map(renderNavItem)}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </nav>
      )}
      
      <div className="border-t p-4 overflow-hidden">
        <div className="text-xs text-muted-foreground">
          {!isCollapsed && (
            <>
              <p className="font-medium truncate">Role: {role || 'Loading...'}</p>
              <p className="mt-1 flex items-center gap-2 whitespace-nowrap">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  isFetching ? "bg-yellow-500" : "bg-success animate-pulse"
                )}></span>
                {isFetching ? "Syncing..." : "Market Open"}
              </p>
            </>
          )}
          {isCollapsed && (
            <div className={cn(
              "h-2 w-2 rounded-full mx-auto",
              isFetching ? "bg-yellow-500" : "bg-success animate-pulse"
            )}></div>
          )}
        </div>
      </div>
    </div>
  );
};
