import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/services/api";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";

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

/** Decodes JWT token payload to extract expiration timestamp (exp) in milliseconds */
const getDecodedTokenExp = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.exp ? decoded.exp * 1000 : null; // Convert seconds to milliseconds
  } catch (error) {
    console.error("Error decoding JWT exp claim:", error);
    return null;
  }
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

  // ── Automatic Inactivity Timeout (15 minutes of idle time) ──────────────────
  useIdleTimeout({
    onIdle: () => {
      if (token) {
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive",
        });
        signOut();
      }
    },
    idleTime: 15 * 60 * 1000,
  });

  // ── Restore session from localStorage on mount ──────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    const savedRole = localStorage.getItem("auth_role") as UserRole;
    const loginTime = localStorage.getItem("auth_login_time");

    if (savedToken && savedUser && savedRole) {
      const expTime = getDecodedTokenExp(savedToken);
      const fallbackExpiration = loginTime ? parseInt(loginTime) + 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000;
      const expirationTime = expTime || fallbackExpiration;

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
      const expTime = getDecodedTokenExp(token);
      const loginTime = localStorage.getItem("auth_login_time");
      const fallbackExpiration = loginTime ? parseInt(loginTime) + 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000;
      const expirationTime = expTime || fallbackExpiration;

      if (Date.now() > expirationTime) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        signOut();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [token, signOut, toast]);

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

