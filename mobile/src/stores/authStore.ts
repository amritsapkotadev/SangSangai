import { create } from "zustand";
import api from "../lib/api";
import { storage } from "../lib/storage";

const DEBUG = true;

export interface User {
  id: string;
  email: string;
  name: string;
  role: "NEPALI" | "FOREIGN" | "ADMIN";
  nationality: string | null;
  walletAddress: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  phone?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  hashedId?: string;
  createdAt?: string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role: "NEPALI" | "FOREIGN";
  nationality?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    if (DEBUG) console.log("[SangSangai] 🔐 login() called for:", email);
    const res = await api.post("/api/auth/login", { email, password });
    if (DEBUG) console.log("[SangSangai] 🔐 login() response:", res.status, JSON.stringify(res.data).slice(0, 150));

    const { token, user } = res.data.data;

    await storage.setToken(token);
    await storage.setUserJson(JSON.stringify(user));
    if (DEBUG) console.log("[SangSangai] 🔐 login() token saved, user:", user.name);

    set({ user, token, isAuthenticated: true });
  },

  signup: async (data) => {
    if (DEBUG) console.log("[SangSangai] 🔐 signup() called for:", data.email);
    const res = await api.post("/api/auth/register", data);
    if (DEBUG) console.log("[SangSangai] 🔐 signup() response:", res.status);

    const { token, user } = res.data.data;

    await storage.setToken(token);
    await storage.setUserJson(JSON.stringify(user));

    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    if (DEBUG) console.log("[SangSangai] 🔐 logout()");
    await storage.clearAuth();
    set({ user: null, token: null, isAuthenticated: false });
    if (DEBUG) console.log("[SangSangai] 🔐 logout() done");
  },

  loadStoredAuth: async () => {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUserJson();
      if (DEBUG) console.log("[SangSangai] 🔐 loadStoredAuth() has_token:", !!storedToken, "has_user:", !!storedUser);

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser) as User;
        if (DEBUG) console.log("[SangSangai] 🔐 loadStoredAuth() restored user:", user.name);
        set({ user, token: storedToken, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      if (DEBUG) console.log("[SangSangai] 🔐 loadStoredAuth() error:", e);
      set({ isLoading: false });
    }
  },

  fetchUser: async () => {
    try {
      const res = await api.get("/api/users/me");
      const user = res.data.data;
      await storage.setUserJson(JSON.stringify(user));
      set({ user });
    } catch {
      get().logout();
    }
  },
}));
