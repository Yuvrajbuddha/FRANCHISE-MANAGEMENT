import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, ROLE_PERMISSIONS, UserPermissions, DEMO_USERS } from "./auth";
import { UserRole } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  permissions: UserPermissions | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  canAccessOutlet: (outletId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("franchise_auth_token");
    const savedUser = localStorage.getItem("franchise_auth_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("franchise_auth_token");
        localStorage.removeItem("franchise_auth_user");
      }
    } else {
      // Default to demo Officer user for immediate testing visibility if not logged in
      const defaultUser = DEMO_USERS.find((u) => u.role === "OFFICER")!;
      // Do not force login if explicitly logged out, but allow quick demo session
      setUser({
        id: defaultUser.id,
        email: defaultUser.email,
        name: defaultUser.name,
        role: defaultUser.role,
        assignedOutletId: defaultUser.assignedOutletId,
        assignedOutletName: defaultUser.assignedOutletName,
        companyId: defaultUser.companyId,
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("franchise_auth_token", data.token);
      localStorage.setItem("franchise_auth_user", JSON.stringify(data.user));

      return { success: true };
    } catch {
      // Graceful fallback for static/offline Vercel deployments
      const matchedDemo = DEMO_USERS.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase().trim() &&
          u.passwordHash === password
      );

      if (matchedDemo) {
        const fallbackUser: AuthUser = {
          id: matchedDemo.id,
          email: matchedDemo.email,
          name: matchedDemo.name,
          role: matchedDemo.role,
          assignedOutletId: matchedDemo.assignedOutletId,
          assignedOutletName: matchedDemo.assignedOutletName,
          companyId: matchedDemo.companyId,
        };
        const mockToken = `demo-token-${matchedDemo.role.toLowerCase()}-${Date.now()}`;
        setToken(mockToken);
        setUser(fallbackUser);
        localStorage.setItem("franchise_auth_token", mockToken);
        localStorage.setItem("franchise_auth_user", JSON.stringify(fallbackUser));
        return { success: true };
      }

      return { success: false, error: "Network error. Could not reach server." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("franchise_auth_token");
    localStorage.removeItem("franchise_auth_user");
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    const targetDemo = DEMO_USERS.find((u) => u.role === targetRole);
    if (!targetDemo) return;
    await login(targetDemo.email, targetDemo.passwordHash);
  };

  // Enforces Requirement 6: Prevent franchise users from accessing another outlet
  const canAccessOutlet = (outletId: string): boolean => {
    if (!user) return false;
    if (user.role === "FRANCHISE") {
      return user.assignedOutletId === outletId;
    }
    return true; // Admin, Owner, Officer have organization-wide access
  };

  const permissions = user ? ROLE_PERMISSIONS[user.role] : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        isLoading,
        login,
        logout,
        switchDemoRole,
        canAccessOutlet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
