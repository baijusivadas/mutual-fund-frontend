
import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

// Lazy-loaded pages
const Index = lazy(() => import("@/pages/dashboard/Index"));
const Login = lazy(() => import("@/pages/auth/Login"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const VerifyOTP = lazy(() => import("@/pages/auth/VerifyOTP"));
const Portfolio = lazy(() => import("@/pages/dashboard/Portfolio"));
const MutualFunds = lazy(() => import("@/pages/assets/MutualFunds"));
const Derivatives = lazy(() => import("@/pages/assets/Derivatives"));
const Transactions = lazy(() => import("@/pages/reports/Transactions"));
const PnL = lazy(() => import("@/pages/dashboard/PnL"));
const CapitalGains = lazy(() => import("@/pages/dashboard/CapitalGains"));
const StockReports = lazy(() => import("@/pages/reports/StockReports"));
const TransactionReports = lazy(() => import("@/pages/reports/TransactionReports"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const RolesManagement = lazy(() => import("@/pages/admin/RolesManagement"));
const RealEstate = lazy(() => import("@/pages/assets/RealEstate"));
const Gold = lazy(() => import("@/pages/assets/Gold"));
const Flats = lazy(() => import("@/pages/assets/Flats"));
const RentalProperties = lazy(() => import("@/pages/assets/RentalProperties"));
const Analytics = lazy(() => import("@/pages/dashboard/Analytics"));
const NotificationHistory = lazy(() => import("@/pages/admin/NotificationHistory"));
const DataUpload = lazy(() => import("@/pages/admin/DataUpload"));
const UserInvestmentMapping = lazy(() => import("@/pages/admin/UserInvestmentMapping"));
const Liabilities = lazy(() => import("@/pages/assets/Liabilities"));
const OtherAssets = lazy(() => import("@/pages/assets/OtherAssets"));
const OtherInvestments = lazy(() => import("@/pages/assets/OtherInvestments"));
const Investors = lazy(() => import("@/pages/admin/Investors"));
const MasterData = lazy(() => import("@/pages/admin/MasterData"));
const NotFound = lazy(() => import("@/pages/errors/NotFound"));

// Full-page loader (used only for initial auth page loads)
const FullPageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Loading FinSight...</p>
    </div>
  </div>
);

// Inner page content loader (keeps sidebar & header fixed and visible during SPA navigation)
const PageContentLoader = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Loading page content...</p>
    </div>
  </div>
);

// Persistent Protected App Layout wrapper
const ProtectedAppLayout = ({ requireSuperAdmin }: { requireSuperAdmin?: boolean }) => (
  <ProtectedRoute requireSuperAdmin={requireSuperAdmin}>
    <DashboardLayout>
      <Suspense fallback={<PageContentLoader />}>
        <Outlet />
      </Suspense>
    </DashboardLayout>
  </ProtectedRoute>
);

export const AppRoutes = () => (
  <Routes>
    {/* Public Auth Routes */}
    <Route
      path="/login"
      element={
        <Suspense fallback={<FullPageLoader />}>
          <Login />
        </Suspense>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <Suspense fallback={<FullPageLoader />}>
          <ForgotPassword />
        </Suspense>
      }
    />
    <Route
      path="/reset-password"
      element={
        <Suspense fallback={<FullPageLoader />}>
          <ResetPassword />
        </Suspense>
      }
    />
    <Route
      path="/verify-otp"
      element={
        <Suspense fallback={<FullPageLoader />}>
          <VerifyOTP />
        </Suspense>
      }
    />

    {/* Protected User Routes (Persistent Sidebar & Header Layout) */}
    <Route element={<ProtectedAppLayout />}>
      <Route path="/" element={<Index />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/mutual-funds" element={<MutualFunds />} />
      <Route path="/derivatives" element={<Derivatives />} />
      <Route path="/liabilities" element={<Liabilities />} />
      <Route path="/other-assets" element={<OtherAssets />} />
      <Route path="/other-investments" element={<OtherInvestments />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/transaction-reports" element={<TransactionReports />} />
      <Route path="/pnl" element={<PnL />} />
      <Route path="/capital-gains" element={<CapitalGains />} />
      <Route path="/stock-reports" element={<StockReports />} />
    </Route>

    {/* Protected Admin Routes (Persistent Sidebar & Header Layout) */}
    <Route element={<ProtectedAppLayout requireSuperAdmin={true} />}>
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/roles" element={<RolesManagement />} />
      <Route path="/admin/real-estate" element={<RealEstate />} />
      <Route path="/admin/gold" element={<Gold />} />
      <Route path="/admin/flats" element={<Flats />} />
      <Route path="/admin/rental-properties" element={<RentalProperties />} />
      <Route path="/admin/analytics" element={<Analytics />} />
      <Route path="/admin/notifications" element={<NotificationHistory />} />
      <Route path="/admin/data-upload" element={<DataUpload />} />
      <Route path="/admin/user-investment-mapping" element={<UserInvestmentMapping />} />
      <Route path="/admin/master-data" element={<MasterData />} />
      <Route path="/admin/investors" element={<Investors />} />
    </Route>

    <Route
      path="*"
      element={
        <Suspense fallback={<FullPageLoader />}>
          <NotFound />
        </Suspense>
      }
    />
  </Routes>
);
