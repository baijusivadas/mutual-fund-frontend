import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Portfolio from "./pages/Portfolio";
import MutualFunds from "./pages/MutualFunds";
import Derivatives from "./pages/Derivatives";
import Transactions from "./pages/Transactions";
import PnL from "./pages/PnL";
import CapitalGains from "./pages/CapitalGains";
import StockReports from "./pages/StockReports";
import TransactionReports from "./pages/TransactionReports";
import UserManagement from "./pages/UserManagement";
import RealEstate from "./pages/RealEstate";
import Gold from "./pages/Gold";
import Flats from "./pages/Flats";
import RentalProperties from "./pages/RentalProperties";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mutual-funds"
                element={
                  <ProtectedRoute>
                    <MutualFunds />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/derivatives"
                element={
                  <ProtectedRoute>
                    <Derivatives />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transaction-reports"
                element={
                  <ProtectedRoute>
                    <TransactionReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pnl"
                element={
                  <ProtectedRoute>
                    <PnL />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/capital-gains"
                element={
                  <ProtectedRoute>
                    <CapitalGains />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock-reports"
                element={
                  <ProtectedRoute>
                    <StockReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireSuperAdmin={true}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/real-estate"
                element={
                  <ProtectedRoute requireSuperAdmin={true}>
                    <RealEstate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/gold"
                element={
                  <ProtectedRoute requireSuperAdmin={true}>
                    <Gold />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/flats"
                element={
                  <ProtectedRoute requireSuperAdmin={true}>
                    <Flats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/rental-properties"
                element={
                  <ProtectedRoute requireSuperAdmin={true}>
                    <RentalProperties />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
