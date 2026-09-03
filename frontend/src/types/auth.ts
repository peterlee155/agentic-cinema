export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: "FREE" | "CREATOR" | "PRO" | "STUDIO" | "ENTERPRISE";
  credits: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
