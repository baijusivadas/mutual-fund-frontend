import { ReactNode, memo } from "react";
import { DynamicSidebar } from "./DynamicSidebar";
import { InvestorSelector } from "./InvestorSelector";
import { Button } from "../ui/button";
import { Moon, Sun, LogOut, User, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "../shared/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayoutComponent = ({ children }: DashboardLayoutProps) => {
  const { theme, setTheme } = useTheme();
  const { user, role, signOut, isSuperAdmin } = useAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] dark:bg-[#020617]">
      <DynamicSidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <header className="sticky top-0 z-40 w-full">
          <div className="bg-background/80 backdrop-blur-xl border-b border-border/50">
            <div className="container mx-auto flex h-20 items-center justify-between px-8">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hidden md:block">
                  Mutual Fund Portal
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                {isSuperAdmin && <InvestorSelector />}
                
                <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
                  ) : (
                    <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
                  )}
                </Button>

                <NotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-muted border p-0 hover:bg-muted/80">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 glass-card">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-semibold leading-none">{user?.email}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          Manage your portfolio
                        </p>
                        <Badge variant={isSuperAdmin ? "default" : "secondary"} className="w-fit text-[10px] uppercase tracking-wider mt-2 px-1.5 py-0">
                          {role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer rounded-md focus:bg-muted" onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-8 animate-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export const DashboardLayout = memo(DashboardLayoutComponent);
