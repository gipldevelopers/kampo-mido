// hooks/useAuth.js

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";

export function useAuth(requiredRole = null) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = AuthService.getStoredUser();

      if (storedUser && AuthService.isAuthenticated()) {
        setUser(storedUser);

        // Check role-based access if requiredRole is specified
        if (requiredRole) {
          const userRole = storedUser.role?.toLowerCase();
          // Role is a string: "admin" or "customer"
          if (requiredRole === "admin" && userRole !== "admin") {
            router.push("/unauthorized");
            return;
          }
          if (requiredRole === "customer" && userRole !== "customer") {
            router.push("/unauthorized");
            return;
          }
          if (Array.isArray(requiredRole) && !requiredRole.includes(userRole)) {
            router.push("/unauthorized");
            return;
          }
        }

        setAccessChecked(true);
      } else {
        // No stored user or token
        router.push("/");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      AuthService.logout();
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const { user: loggedInUser } = await AuthService.login(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    AuthService.logout();
    setUser(null);
    router.push("/");
  };

  const hasRole = (role) => {
    if (!user || !user.role) return false;
    const userRole = user.role.toLowerCase();
    const checkRole = typeof role === "string" ? role.toLowerCase() : role;
    return userRole === checkRole;
  };

  const hasAnyRole = (roles) => {
    if (!user || !user.role) return false;
    const userRole = user.role.toLowerCase();
    return roles.some((role) => {
      const checkRole = typeof role === "string" ? role.toLowerCase() : role;
      return userRole === checkRole;
    });
  };

  const isAdmin = () => {
    if (!user || !user.role) return false;
    return user.role.toLowerCase() === "admin";
  };

  const isCustomer = () => {
    if (!user || !user.role) return false;
    return user.role.toLowerCase() === "customer";
  };

  return {
    user,
    loading,
    accessChecked,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin,
    isCustomer,
    checkAuth,
  };
}

