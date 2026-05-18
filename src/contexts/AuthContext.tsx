import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/services/api";

type UserRole = "superAdmin" | "user";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  verifyOTP: (email: string, otp: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Clear all auth keys from localStorage */
const clearAuthStorage = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_role");
  localStorage.removeItem("auth_login_time");
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // ── Stable signOut (used inside effects so must be useCallback) ─────────────
  const signOut = useCallback(async () => {
    // Notify backend so the session is destroyed server-side
    try {
      await authApi.logout();
    } catch {
      // Best-effort: clear client state regardless
    }
    setToken(null);
    setUser(null);
    setRole(null);
    clearAuthStorage();
    toast({ title: "Success", description: "Logged out successfully" });
  }, [toast]);

  // ── Restore session from localStorage on mount ──────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    const savedRole = localStorage.getItem("auth_role") as UserRole;
    const loginTime = localStorage.getItem("auth_login_time");

    if (savedToken && savedUser && savedRole && loginTime) {
      const expirationTime = parseInt(loginTime) + 24 * 60 * 60 * 1000;
      if (Date.now() > expirationTime) {
        signOut();
      } else {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setRole(savedRole);
      }
    }
    setLoading(false);
  }, [signOut]);

  // ── Periodic token expiration check (every minute) ──────────────────────────
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      const loginTime = localStorage.getItem("auth_login_time");
      if (loginTime) {
        const expirationTime = parseInt(loginTime) + 24 * 60 * 60 * 1000;
        if (Date.now() > expirationTime) {
          signOut();
        }
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [token, signOut]);

  // ── Sign In ─────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const payload = response.data?.data ?? response.data; // handles { status, message, data } wrapper

      setToken(payload.token);
      setUser(payload.user);
      setRole(payload.role);
      localStorage.setItem("auth_token", payload.token);
      localStorage.setItem("auth_user", JSON.stringify(payload.user));
      localStorage.setItem("auth_role", payload.role);
      localStorage.setItem("auth_login_time", Date.now().toString());

      toast({ title: "Success", description: "Logged in successfully" });
      return { error: null };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Login failed";
      toast({ title: "Error", description: message, variant: "destructive" });
      return { error: message };
    }
  };

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      await authApi.signup({ email, password, name: fullName });
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
      return { error: null };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Signup failed";
      toast({ title: "Error", description: message, variant: "destructive" });
      return { error: message };
    }
  };

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const verifyOTP = async (email: string, otp: string) => {
    try {
      await authApi.verifyOtp({ email, otp });
      toast({ title: "Success", description: "Account verified! You can now log in." });
      return { error: null };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Verification failed";
      toast({ title: "Error", description: message, variant: "destructive" });
      return { error: message };
    }
  };

  // ── Reset Password ──────────────────────────────────────────────────────────
  const resetPassword = async (email: string) => {
    try {
      await authApi.forgotPassword({ email });
      toast({ title: "Instructions Sent", description: "Check your email for reset instructions." });
      return { error: null };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Request failed";
      toast({ title: "Error", description: message, variant: "destructive" });
      return { error: message };
    }
  };

  // ── Update Password (not yet implemented) ───────────────────────────────────
  const updatePassword = async (_newPassword: string) => {
    return { error: "Not implemented yet" };
  };

  const isSuperAdmin = role === "superAdmin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        signIn,
        signUp,
        verifyOTP,
        signOut,
        resetPassword,
        updatePassword,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
