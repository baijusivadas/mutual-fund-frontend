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
import { ChevronLeft, PanelLeft, Circle, MoreHorizontal, TrendingUp } from "lucide-react";

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
  Database: LucideIcons.Database,
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
      name: "Assets",
      icon: LucideIcons.Building2,
      routes: ["/admin/real-estate", "/admin/gold", "/admin/flats", "/admin/rental-properties"]
    },
    {
      id: "inv_mgmt",
      name: "Portfolio",
      icon: LucideIcons.Briefcase,
      routes: ["/portfolio", "/mutual-funds", "/derivatives", "/other-investments", "/other-assets", "/liabilities"]
    },
    {
      id: "reports_analytics",
      name: "Insights",
      icon: LucideIcons.BarChart3,
      routes: ["/transactions", "/transaction-reports", "/pnl", "/capital-gains", "/stock-reports", "/admin/analytics"]
    },
    {
      id: "admin",
      name: "System",
      icon: LucideIcons.Shield,
      routes: ["/admin/users", "/admin/roles", "/admin/investors", "/admin/data-upload", "/admin/master-data", "/admin/user-investment-mapping", "/admin/notifications"]
    }
  ], []);

  // Categorize items into the defined categories
  const categorizedMenu = useMemo(() => {
    if (!sidebarItems) return { main: [], accordion: [] };
    
    const dashboard = sidebarItems.find(item => item.href === "/");
    const mainItems = dashboard ? [dashboard] : [];
    
    const accordionGroups = categories.map(cat => ({
      ...cat,
      children: sidebarItems.filter(item => cat.routes.includes(item.href))
    })).filter(group => group.children.length > 0);

    const categorizedHrefs = ["/", ...categories.flatMap(cat => cat.routes)];
    const otherItems = sidebarItems.filter(item => !categorizedHrefs.includes(item.href));
    
    if (otherItems.length > 0) {
      accordionGroups.push({
        id: "other",
        name: "More",
        icon: MoreHorizontal,
        routes: [],
        children: otherItems
      });
    }

    return { main: mainItems, accordion: accordionGroups };
  }, [sidebarItems, categories]);

  useEffect(() => {
    const activeGroup = categorizedMenu.accordion.find(group => 
      group.children.some(child => child.href === location.pathname)
    );
    if (activeGroup) {
      setOpenCategory(activeGroup.id);
    }
  }, [location.pathname, categorizedMenu.accordion]);

  const renderNavItem = (item: SidebarItem) => {
    const IconComponent = iconMap[item.icon] || Circle;

    return (
      <NavLink
        key={item.id}
        to={item.href}
        end={item.href === "/"}
        className={({ isActive }) =>
          cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            isActive
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )
        }
      >
        <IconComponent className="h-[18px] w-[18px] shrink-0" />
        {!isCollapsed && <span className="truncate">{item.name}</span>}
      </NavLink>
    );
  };

  return (
    <div 
      className={cn(
        "flex h-screen flex-col border-r bg-background/50 backdrop-blur-xl transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      <div className={cn(
        "flex h-20 items-center border-b border-border/50 px-6",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TradePro</h1>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 hover:bg-muted rounded-lg"
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto no-scrollbar">
        {categorizedMenu.main.map(renderNavItem)}

        <Accordion 
          type="single" 
          collapsible 
          value={openCategory}
          onValueChange={setOpenCategory}
          className="space-y-1.5 mt-4"
        >
          {!isCollapsed && categorizedMenu.accordion.map((group) => (
            <AccordionItem key={group.id} value={group.id} className="border-none">
              <AccordionTrigger className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all hover:bg-muted hover:no-underline group",
                openCategory === group.id ? "text-foreground bg-muted/40" : "text-muted-foreground"
              )}>
                <div className="flex items-center gap-3">
                  <group.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{group.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pl-4 pt-1 space-y-1 border-l ml-5 mt-1 border-border/50">
                {group.children.map(renderNavItem)}
              </AccordionContent>
            </AccordionItem>
          ))}
          {isCollapsed && categorizedMenu.accordion.map(group => (
            <div key={group.id} className="pt-2">
              {group.children.map(renderNavItem)}
            </div>
          ))}
        </Accordion>
      </nav>
      
      <div className="border-t border-border/50 p-6 bg-muted/20">
  
      </div>
    </div>
  );
};
