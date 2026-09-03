"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "../types/auth";

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: "usr_producer_01",
  email: "producer@agenticcinema.ai",
  name: "Peter Lee (Producer)",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Peter",
  plan: "PRO",
  credits: 202,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persistent login session
    const savedUser = localStorage.getItem("agentic_cinema_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("agentic_cinema_user");
      }
    } else {
      // Default to logged-in producer for seamless experience
      setUser(MOCK_USER);
      localStorage.setItem("agentic_cinema_user", JSON.stringify(MOCK_USER));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    const loggedUser: User = {
      ...MOCK_USER,
      email: email || MOCK_USER.email,
      name: email.split("@")[0] || MOCK_USER.name,
    };
    setUser(loggedUser);
    localStorage.setItem("agentic_cinema_user", JSON.stringify(loggedUser));
    setIsLoading(false);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    setUser(MOCK_USER);
    localStorage.setItem("agentic_cinema_user", JSON.stringify(MOCK_USER));
    setIsLoading(false);
    return true;
  };

  const signup = async (email: string, pass: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email,
      name,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
