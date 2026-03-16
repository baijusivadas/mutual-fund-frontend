import { ReactNode, memo } from "react";
import { DynamicSidebar } from "./DynamicSidebar";
import { InvestorSelector } from "./InvestorSelector";
import { Breadcrumbs } from "./Breadcrumbs";
import { Button } from "./ui/button";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "./shared/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayoutComponent = ({ children }: DashboardLayoutProps) => {
  const { theme, setTheme } = useTheme();
  const { user, role, signOut, isSuperAdmin } = useAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DynamicSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="border-b bg-card">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <Breadcrumbs />
            <div className="flex items-center gap-4">
              {isSuperAdmin && <InvestorSelector />}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.email}</p>
                      <Badge variant={isSuperAdmin ? "default" : "secondary"} className="w-fit text-xs">
                        {role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
};

export const DashboardLayout = memo(DashboardLayoutComponent);
