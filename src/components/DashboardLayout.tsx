import { ReactNode, memo, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { InvestorSelector } from "./InvestorSelector";
import { Button } from "./ui/button";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
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

  /** Toggle dark/light theme */
  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <h1 className="text-lg font-semibold">Investor Portfolio</h1>

            <div className="flex items-center gap-4">
              {/* Investor Selector */}
              <InvestorSelector />

              {/* Theme Toggle Button */}
              <Button variant="outline" size="icon" onClick={handleThemeToggle}>
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* User / Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-60 shadow-lg border rounded-xl p-1"
                >
                  {/* Profile Header */}
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.email}</p>

                      <Badge
                        variant={isSuperAdmin ? "default" : "secondary"}
                        className="w-fit text-xs"
                      >
                        {role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={signOut}
                    className="cursor-pointer flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
};

export const DashboardLayout = memo(DashboardLayoutComponent);
