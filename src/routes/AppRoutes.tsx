import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

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

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      
      {/* Protected User Routes */}
      {[
        { path: "/", element: <Index /> },
        { path: "/portfolio", element: <Portfolio /> },
        { path: "/mutual-funds", element: <MutualFunds /> },
        { path: "/derivatives", element: <Derivatives /> },
        { path: "/liabilities", element: <Liabilities /> },
        { path: "/other-assets", element: <OtherAssets /> },
        { path: "/other-investments", element: <OtherInvestments /> },
        { path: "/investors", element: <Investors /> },
        { path: "/transactions", element: <Transactions /> },
        { path: "/transaction-reports", element: <TransactionReports /> },
        { path: "/pnl", element: <PnL /> },
        { path: "/capital-gains", element: <CapitalGains /> },
        { path: "/stock-reports", element: <StockReports /> },
      ].map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<ProtectedRoute>{route.element}</ProtectedRoute>}
        />
      ))}

      {/* Protected Admin Routes */}
      {[
        { path: "/admin/users", element: <UserManagement /> },
        { path: "/admin/roles", element: <RolesManagement /> },
        { path: "/admin/real-estate", element: <RealEstate /> },
        { path: "/admin/gold", element: <Gold /> },
        { path: "/admin/flats", element: <Flats /> },
        { path: "/admin/rental-properties", element: <RentalProperties /> },
        { path: "/admin/analytics", element: <Analytics /> },
        { path: "/admin/notifications", element: <NotificationHistory /> },
        { path: "/admin/data-upload", element: <DataUpload /> },
        { path: "/admin/user-investment-mapping", element: <UserInvestmentMapping /> },
        { path: "/admin/master-data", element: <MasterData /> },
      ].map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<ProtectedRoute requireSuperAdmin={true}>{route.element}</ProtectedRoute>}
        />
      ))}

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);
