import axios from "axios";

// In development, Vite proxies /api → backend, so we use relative "/api".
// In production (Vercel), VITE_BACKEND_URL must be set in the Vercel dashboard;
// the full URL is used directly instead of a proxy.
const backendEnv = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");
const isDev = import.meta.env.DEV;
const baseURL = isDev ? "/api" : backendEnv ? `${backendEnv}/api` : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach auth token ────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ─────────────────────────────────
// Only auto-logout when the user was authenticated AND the failing request was
// NOT an auth endpoint (login/signup/otp/forgot-password).
// Prevents: login-failure redirect loops, spurious logouts from parallel fetches.
const AUTH_ROUTE_PREFIXES = ["/auth/login", "/auth/signup", "/auth/verify-otp", "/auth/forgot-password"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl: string = error.config?.url ?? "";
      const isAuthEndpoint = AUTH_ROUTE_PREFIXES.some((prefix) => requestUrl.includes(prefix));
      const isAlreadyOnLogin = window.location.pathname === "/login";
      const wasAuthenticated = !!localStorage.getItem("auth_token");

      if (!isAuthEndpoint && !isAlreadyOnLogin && wasAuthenticated) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_role");
        localStorage.removeItem("auth_login_time");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth endpoints ────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  signup: (data: { email: string; password: string; name?: string }) =>
    api.post("/auth/signup", data),
  verifyOtp: (data: { email: string; otp: string }) => api.post("/auth/verify-otp", data),
  forgotPassword: (data: { email: string }) => api.post("/auth/forgot-password", data),
  logout: () => api.post("/auth/logout"),
  getUsers: () => api.get("/auth/users"),
  updateUserRole: (userId: string, role: string) =>
    api.patch(`/auth/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete(`/auth/users/${userId}`),
};

// ── Investor endpoints ────────────────────────────────────────────────────────
export const investorApi = {
  getAll: () => api.get("/investors"),
  getById: (id: string) => api.get(`/investors/${id}`),
  create: (data: unknown) => api.post("/investors", data),
  update: (id: string, data: unknown) => api.put(`/investors/${id}`, data),
  delete: (id: string) => api.delete(`/investors/${id}`),
  updateKyc: (id: string, data: unknown) => api.put(`/investors/${id}/kyc`, data),
};

// ── Master data endpoints ─────────────────────────────────────────────────────
export const masterApi = {
  getFundHouses: () => api.get("/fund-houses"),
  createFundHouse: (data: unknown) => api.post("/fund-houses", data),
  getMutualFunds: (params?: unknown) => api.get("/mutual-funds", { params }),
  createMutualFund: (data: unknown) => api.post("/mutual-funds", data),
  addNav: (id: string, data: unknown) => api.post(`/mutual-funds/${id}/nav`, data),
  getStocks: (params?: unknown) => api.get("/stocks", { params }),
};

export default api;
