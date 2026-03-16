import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { InvestorProvider } from "@/contexts/InvestorContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy-loaded pages for code splitting (improves FCP, LCP, TBT)
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const MutualFunds = lazy(() => import("./pages/MutualFunds"));
const Derivatives = lazy(() => import("./pages/Derivatives"));
const Transactions = lazy(() => import("./pages/Transactions"));
const PnL = lazy(() => import("./pages/PnL"));
const CapitalGains = lazy(() => import("./pages/CapitalGains"));
const StockReports = lazy(() => import("./pages/StockReports"));
const TransactionReports = lazy(() => import("./pages/TransactionReports"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const RolesManagement = lazy(() => import("./pages/RolesManagement"));
const RealEstate = lazy(() => import("./pages/RealEstate"));
const Gold = lazy(() => import("./pages/Gold"));
const Flats = lazy(() => import("./pages/Flats"));
const RentalProperties = lazy(() => import("./pages/RentalProperties"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotificationHistory = lazy(() => import("./pages/NotificationHistory"));
const DataUpload = lazy(() => import("./pages/DataUpload"));
const UserInvestmentMapping = lazy(() => import("./pages/UserInvestmentMapping"));
const Liabilities = lazy(() => import("./pages/Liabilities"));
const OtherAssets = lazy(() => import("./pages/OtherAssets"));
const OtherInvestments = lazy(() => import("./pages/OtherInvestments"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Minimal page-level loading skeleton
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

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
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
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
                      path="/liabilities"
                      element={
                        <ProtectedRoute>
                          <Liabilities />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/other-assets"
                      element={
                        <ProtectedRoute>
                          <OtherAssets />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/other-investments"
                      element={
                        <ProtectedRoute>
                          <OtherInvestments />
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
                      path="/admin/roles"
                      element={
                        <ProtectedRoute requireSuperAdmin={true}>
                          <RolesManagement />
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
                    <Route
                      path="/admin/analytics"
                      element={
                        <ProtectedRoute requireSuperAdmin={true}>
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/notifications"
                      element={
                        <ProtectedRoute requireSuperAdmin={true}>
                          <NotificationHistory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/data-upload"
                      element={
                        <ProtectedRoute requireSuperAdmin={true}>
                          <DataUpload />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/user-investment-mapping"
                      element={
                        <ProtectedRoute requireSuperAdmin={true}>
                          <UserInvestmentMapping />
                        </ProtectedRoute>
                      }
                    />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </InvestorProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
