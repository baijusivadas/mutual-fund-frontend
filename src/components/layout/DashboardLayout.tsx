import { ReactNode, memo, useState } from "react";
import { DynamicSidebar } from "./DynamicSidebar";
import { InvestorSelector } from "./InvestorSelector";
import { Button } from "../ui/button";
import { Moon, Sun, LogOut, User, Menu, Shield } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayoutComponent = ({ children }: DashboardLayoutProps) => {
  const { theme, setTheme } = useTheme();
  const { user, role, signOut, isSuperAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar (hidden on small/medium mobile screens) */}
      <div className="hidden lg:block shrink-0">
        <DynamicSidebar />
      </div>

      <main className="flex-1 overflow-y-auto relative flex flex-col min-w-0">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full -ml-40 -mb-40 pointer-events-none" />

        <header className="sticky top-0 z-40 w-full shrink-0">
          <div className="bg-background/80 backdrop-blur-2xl border-b border-border/50 transition-colors">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-8">
              <div className="flex items-center gap-3">
                {/* Mobile Navigation Drawer */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden rounded-xl hover:bg-muted">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 border-r w-72 bg-background/95 backdrop-blur-2xl">
                    <SheetHeader className="sr-only">
                      <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <DynamicSidebar />
                  </SheetContent>
                </Sheet>

                <h2 className="text-xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent truncate">
                  FinSight Portfolio
                </h2>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {isSuperAdmin && (
                  <div className="hidden sm:block">
                    <InvestorSelector />
                  </div>
                )}

                {isSuperAdmin && <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />}

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted/80 transition-transform active:scale-95"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  title="Toggle Theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-amber-400 transition-all" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-700 transition-all" />
                  )}
                </Button>

                <NotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full bg-muted/60 border border-border/50 p-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <User className="h-5 w-5 text-foreground/80" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 glass-card rounded-2xl">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1.5 p-2">
                        <p className="text-sm font-semibold leading-none truncate">{user?.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">Wealth Account</p>
                        <Badge
                          variant={isSuperAdmin ? "default" : "secondary"}
                          className="w-fit text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold mt-1"
                        >
                          {role || "user"}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer rounded-xl focus:bg-destructive/10 focus:text-destructive text-destructive font-medium"
                      onClick={signOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-4 sm:p-8 space-y-8 flex-1 animate-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export const DashboardLayout = memo(DashboardLayoutComponent);
