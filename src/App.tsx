import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { InvestorProvider } from "@/contexts/InvestorContext";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AppRoutes } from "@/routes/AppRoutes";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "A data query failed");
      // Avoid redirect status codes
      if (getErrorStatus(error) !== 401) {
        toast({
          title: "Query Error",
          description: message,
          variant: "destructive",
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "An action failed");
      if (getErrorStatus(error) !== 401) {
        toast({
          title: "Action Error",
          description: message,
          variant: "destructive",
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes default stale time
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <InvestorProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </InvestorProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
