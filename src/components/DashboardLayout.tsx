import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { InvestorSelector } from "./InvestorSelector";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="border-b bg-card">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <h1 className="text-lg font-semibold">Investor Portfolio</h1>
            <div className="flex items-center gap-4">
              <InvestorSelector />
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
            </div>
          </div>
        </div>
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
};
