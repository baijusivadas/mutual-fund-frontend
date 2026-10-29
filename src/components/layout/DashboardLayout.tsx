import { createContext, useContext, ReactNode, memo } from "react";
import { Outlet } from "react-router-dom";
import { Topbar } from "./Topbar";
import { AIChatbot } from "@/components/shared/AIChatbot";

export const DashboardLayoutContext = createContext<boolean>(false);

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayoutComponent = ({ children }: DashboardLayoutProps) => {
  const isInsideLayout = useContext(DashboardLayoutContext);

  // If already rendered inside an existing DashboardLayout context, return children or Outlet directly
  // so nested page-level DashboardLayout wrappers don't duplicate the topbar.
  if (isInsideLayout) {
    return <>{children || <Outlet />}</>;
  }

  return (
    <DashboardLayoutContext.Provider value={true}>
      <div className="relative min-h-screen w-full flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary transition-colors duration-300 overflow-x-hidden">
        {/* Dark-mode-only ambient glow — invisible in light mode */}
        <div className="pointer-events-none fixed -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-transparent dark:bg-blue-600/10 blur-[120px] z-0" />
        <div className="pointer-events-none fixed -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-transparent dark:bg-indigo-600/10 blur-[130px] z-0" />

        {/* Topbar Navigation */}
        <Topbar />

        {/* Main Content Area */}
        <main className="flex-1 w-full relative z-10 flex flex-col">
          <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-5 lg:px-6 py-3.5 sm:py-4 flex-1 animate-in">
            {children || <Outlet />}
          </div>
        </main>

        {/* AI Chatbot floating widget - available on all authenticated pages */}
        <AIChatbot />
      </div>
    </DashboardLayoutContext.Provider>
  );
};

export const DashboardLayout = memo(DashboardLayoutComponent);
