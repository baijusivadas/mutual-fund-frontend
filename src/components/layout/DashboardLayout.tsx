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
        {/* Background Ambient Glow Accents (Adapted for Light & Dark) */}
        <div className="pointer-events-none fixed -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-600/10 dark:bg-blue-600/15 blur-[140px] z-0" />
        <div className="pointer-events-none fixed -bottom-40 -right-40 h-[560px] w-[560px] rounded-full bg-indigo-600/10 dark:bg-indigo-600/15 blur-[150px] z-0" />
        <div className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 h-[680px] w-[680px] rounded-full bg-sky-500/5 dark:bg-sky-500/8 blur-[160px] z-0" />

        {/* Subtle Dot Grid Texture Overlay using currentColor */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.04] dark:opacity-[0.035] z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Topbar Navigation */}
        <Topbar />

        {/* Main Content Area */}
        <main className="flex-1 w-full relative z-10 flex flex-col">
          <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 flex-1 animate-in">
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
