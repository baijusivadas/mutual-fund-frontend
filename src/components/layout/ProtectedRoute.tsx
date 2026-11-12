import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
  requireAdvisor?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireSuperAdmin = false,
  requireAdvisor = false,
}: ProtectedRouteProps) => {
  const { user, loading, isSuperAdmin, isAdvisor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (requireSuperAdmin && !isSuperAdmin) {
        navigate("/");
      } else if (requireAdvisor && !isAdvisor && !isSuperAdmin) {
        navigate("/");
      }
    }
  }, [user, loading, isSuperAdmin, isAdvisor, requireSuperAdmin, requireAdvisor, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (requireSuperAdmin && !isSuperAdmin) || (requireAdvisor && !isAdvisor && !isSuperAdmin)) {
    return null;
  }

  return <>{children}</>;
};
