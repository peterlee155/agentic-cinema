"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "../types/auth";

interface GoogleAuthProfile {
  id?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: (googleProfile?: GoogleAuthProfile) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persistent login session if previously logged in
    const savedUser = localStorage.getItem("agentic_cinema_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("agentic_cinema_user");
        setUser(null);
      }
    } else {
      // Require real authentication first
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    const loggedUser: User = {
      id: `usr_${Date.now()}`,
      email: email || "creator@agenticcinema.ai",
      name: email ? email.split("@")[0] : "Cinema Producer",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email || "producer")}`,
      plan: "PRO",
      credits: 250,
    };
    setUser(loggedUser);
    localStorage.setItem("agentic_cinema_user", JSON.stringify(loggedUser));
    setIsLoading(false);
    return true;
  };

  const loginWithGoogle = async (googleProfile?: GoogleAuthProfile): Promise<boolean> => {
    setIsLoading(true);
    const googleUser: User = {
      id: googleProfile?.id || `usr_google_${Date.now()}`,
      email: googleProfile?.email || "leepeter014@gmail.com",
      name: googleProfile?.name || "Peter Lee",
      avatarUrl: googleProfile?.avatarUrl || "https://lh3.googleusercontent.com/a/default-user=s96-c",
      plan: "STUDIO",
      credits: 500,
    };
    setUser(googleUser);
    localStorage.setItem("agentic_cinema_user", JSON.stringify(googleUser));
    setIsLoading(false);
    return true;
  };

  const signup = async (email: string, pass: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      name: name || email.split("@")[0],
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || "director")}`,
      plan: "PRO",
      credits: 200,
    };
    setUser(newUser);
    localStorage.setItem("agentic_cinema_user", JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("agentic_cinema_user");
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
