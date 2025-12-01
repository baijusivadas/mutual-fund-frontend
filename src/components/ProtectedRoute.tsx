import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireSuperAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (requireSuperAdmin && !isSuperAdmin) {
        navigate("/");
      }
    }
  }, [user, loading, isSuperAdmin, requireSuperAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (requireSuperAdmin && !isSuperAdmin)) {
    return null;
  }

  return <>{children}</>;
};
