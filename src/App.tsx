import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import MutualFunds from "./pages/MutualFunds";
import Derivatives from "./pages/Derivatives";
import Transactions from "./pages/Transactions";
import PnL from "./pages/PnL";
import CapitalGains from "./pages/CapitalGains";
import StockReports from "./pages/StockReports";
import TransactionReports from "./pages/TransactionReports";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/mutual-funds" element={<MutualFunds />} />
            <Route path="/derivatives" element={<Derivatives />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transaction-reports" element={<TransactionReports />} />
            <Route path="/pnl" element={<PnL />} />
            <Route path="/capital-gains" element={<CapitalGains />} />
            <Route path="/stock-reports" element={<StockReports />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
