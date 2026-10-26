import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/services/api";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { getErrorMessage } from "@/lib/errors";

type UserRole = "superAdmin" | "user";

interface User {
  id: string;
  email: string;
  name?: string;
}

type AuthResult = { error: string | null };

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "email" in value &&
    typeof value.email === "string"
  );
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthResult>;
  verifyOTP: (email: string, otp: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  isSuperAdmin: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  role: null,
  loading: false,
  signIn: async () => ({ error: "Auth service not ready" }),
  signUp: async () => ({ error: "Auth service not ready" }),
  verifyOTP: async () => ({ error: "Auth service not ready" }),
  signOut: async () => {},
  resetPassword: async () => ({ error: "Auth service not ready" }),
  updatePassword: async () => ({ error: "Auth service not ready" }),
  isSuperAdmin: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

/** Clear all auth keys from localStorage */
const clearAuthStorage = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_role");
  localStorage.removeItem("auth_login_time");
};

/** Decodes JWT token payload */
const getDecodedTokenPayload = (token: string | null): Record<string, unknown> | null => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/** Decodes JWT token payload to extract expiration timestamp (exp) in milliseconds */
const getDecodedTokenExp = (token: string | null): number | null => {
  const decoded = getDecodedTokenPayload(token);
  return decoded && decoded.exp ? Number(decoded.exp) * 1000 : null;
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

  // ── Automatic Inactivity Timeout (2 hours of idle time) ──────────────────────
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
    idleTime: 2 * 60 * 60 * 1000, // 2 hours
  });

  // ── Restore session from localStorage on mount ──────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    const savedRole = localStorage.getItem("auth_role") as UserRole | null;
    const loginTime = localStorage.getItem("auth_login_time");

    if (savedToken && (savedRole === "superAdmin" || savedRole === "user")) {
      const expTime = getDecodedTokenExp(savedToken);
      const fallbackExpiration = loginTime
        ? parseInt(loginTime) + 24 * 60 * 60 * 1000
        : Date.now() + 24 * 60 * 60 * 1000;
      const expirationTime = expTime || fallbackExpiration;

      if (Date.now() > expirationTime) {
        clearAuthStorage();
        setUser(null);
        setToken(null);
        setRole(null);
      } else {
        const decoded = getDecodedTokenPayload(savedToken);
        let restoredUser: User | null = null;

        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed && typeof parsed === "object") {
              const emailVal = parsed.email || (decoded?.email ? String(decoded.email) : "");
              restoredUser = {
                id: parsed.id || parsed.auth_user_id || (decoded?.id ? String(decoded.id) : ""),
                email: emailVal,
                name: parsed.name || (emailVal ? emailVal.split("@")[0] : "User"),
              };
            }
          } catch {
            // fallback
          }
        }

        if (!restoredUser && decoded) {
          const emailVal = decoded.email ? String(decoded.email) : "";
          restoredUser = {
            id: decoded.id ? String(decoded.id) : "",
            email: emailVal,
            name: emailVal ? emailVal.split("@")[0] : "User",
          };
        }

        if (restoredUser && restoredUser.id) {
          setUser(restoredUser);
          setRole(savedRole);
          setToken(savedToken);
          localStorage.setItem("auth_user", JSON.stringify(restoredUser));
        } else {
          clearAuthStorage();
        }
      }
    } else if (savedToken || savedUser || savedRole) {
      clearAuthStorage();
    }
    setLoading(false);
  }, [signOut]);

  // ── Periodic token expiration check (every minute) ──────────────────────────
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      const expTime = getDecodedTokenExp(token);
      const loginTime = localStorage.getItem("auth_login_time");
      const fallbackExpiration = loginTime
        ? parseInt(loginTime) + 24 * 60 * 60 * 1000
        : Date.now() + 24 * 60 * 60 * 1000;
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

      const userObj: User = {
        id: payload.user?.auth_user_id || payload.user?.id || "",
        email: payload.user?.email || email,
        name: payload.user?.name || email.split("@")[0],
      };

      setToken(payload.token);
      setUser(userObj);
      setRole(payload.role);
      localStorage.setItem("auth_token", payload.token);
      localStorage.setItem("auth_user", JSON.stringify(userObj));
      localStorage.setItem("auth_role", payload.role);
      localStorage.setItem("auth_login_time", Date.now().toString());

      toast({ title: "Success", description: "Logged in successfully" });
      return { error: null };
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Login failed");
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
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Signup failed");
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
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Verification failed");
      toast({ title: "Error", description: message, variant: "destructive" });
      return { error: message };
    }
  };

  // ── Reset Password ──────────────────────────────────────────────────────────
  const resetPassword = async (email: string) => {
    try {
      await authApi.forgotPassword({ email });
      toast({
        title: "Instructions Sent",
        description: "Check your email for reset instructions.",
      });
      return { error: null };
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Request failed");
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
  return context || defaultAuthContext;
};
