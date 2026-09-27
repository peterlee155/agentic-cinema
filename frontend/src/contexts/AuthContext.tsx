"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "../types/auth";

export const DEFAULT_STUDIO_DIRECTOR: User = {
  id: "guest_director",
  email: "director@agenticcinema.ai",
  name: "Studio Director (Judge / Demo Mode)",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=StudioDirector",
  plan: "STUDIO",
  credits: 2500,
};

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  enterAsGuest: () => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return DEFAULT_STUDIO_DIRECTOR;
    const saved = localStorage.getItem("agentic_cinema_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_STUDIO_DIRECTOR;
      }
    }
    return DEFAULT_STUDIO_DIRECTOR;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    // 2. Validate session with backend if token exists
    const token = localStorage.getItem("agentic_cinema_token");
    if (token && token !== "guest_demo_token") {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setUser(data.user);
            localStorage.setItem("agentic_cinema_user", JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // Keep current user on network blip
        });
    }
  }, []);

  const enterAsGuest = () => {
    setUser(DEFAULT_STUDIO_DIRECTOR);
    localStorage.setItem("agentic_cinema_user", JSON.stringify(DEFAULT_STUDIO_DIRECTOR));
    localStorage.setItem("agentic_cinema_token", "guest_demo_token");
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("agentic_cinema_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("agentic_cinema_token", data.token);
        }
        return true;
      }
      throw new Error(data.detail || data.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: pass,
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("agentic_cinema_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("agentic_cinema_token", data.token);
        }
        return true;
      }
      // If signup endpoint doesn't exist, fallback to login
      return await login(email, pass);
    } catch {
      return await login(email, pass);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate/call Google auth endpoint
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "producer@agenticcinema.ai",
          name: "Cinema Director",
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("agentic_cinema_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("agentic_cinema_token", data.token);
        }
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    const token = localStorage.getItem("agentic_cinema_token");
    if (token) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    setUser(DEFAULT_STUDIO_DIRECTOR);
    localStorage.removeItem("agentic_cinema_token");
    localStorage.setItem("agentic_cinema_user", JSON.stringify(DEFAULT_STUDIO_DIRECTOR));
  };

  const resetPassword = async (email: string): Promise<void> => {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        resetPassword,
        enterAsGuest,
        isGuest: user?.id === "guest_director",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
