"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier";
  restaurantId: string;
  restaurantName: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ otpSent: boolean; error?: string }>;
  verifySignupOtp: (email: string, token: string, data: SignupData) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string, accessToken: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

interface SignupData {
  restaurantName: string;
  ownerName: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, restore session from the httpOnly cookie via /api/auth/me
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error ?? "Login failed" };
      setUser(json.user);
      return { success: true };
    } catch {
      return { success: false, error: "Something went wrong" };
    }
  }, []);

  const signup = useCallback(async (data: SignupData): Promise<{ otpSent: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) return { otpSent: false, error: json.error ?? "Signup failed" };
      return { otpSent: true };
    } catch {
      return { otpSent: false, error: "Something went wrong" };
    }
  }, []);

  const verifySignupOtp = useCallback(async (
    email: string,
    token: string,
    data: SignupData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          restaurantName: data.restaurantName,
          ownerName: data.ownerName,
          password: data.password,
        }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error ?? "Verification failed" };
      setUser(json.user);
      return { success: true };
    } catch {
      return { success: false, error: "Something went wrong" };
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error ?? "Failed to send reset email" };
      return { success: true };
    } catch {
      return { success: false, error: "Something went wrong" };
    }
  }, []);

  const updatePassword = useCallback(async (password: string, accessToken: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, accessToken }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error ?? "Failed to update password" };
      return { success: true };
    } catch {
      return { success: false, error: "Something went wrong" };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, signup, verifySignupOtp, resetPassword, updatePassword, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
