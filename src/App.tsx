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

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || "A data query failed";
      // Avoid redirect status codes
      if (error.response?.status !== 401) {
        toast({
          title: "Query Error",
          description: message,
          variant: "destructive",
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || "An action failed";
      if (error.response?.status !== 401) {
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
