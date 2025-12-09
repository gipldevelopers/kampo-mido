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
        // Try to get current user from API (validates token)
        const currentUser = await AuthService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);

          // Check role-based access if requiredRole is specified
          if (requiredRole) {
            const userRole = currentUser.role;
            // Role 1 = Admin, Role 2 = Customer
            if (requiredRole === "admin" && userRole !== 1) {
              router.push("/unauthorized");
              return;
            }
            if (requiredRole === "customer" && userRole !== 2) {
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
          // Token invalid or expired
          AuthService.logout();
          router.push("/");
        }
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

  const login = async (email, password) => {
    try {
      const { user: loggedInUser } = await AuthService.login(email, password);
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
    if (!user) return false;
    // Role 1 = Admin, Role 2 = Customer
    if (role === "admin") return user.role === 1;
    if (role === "customer") return user.role === 2;
    return user.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.some((role) => {
      if (role === "admin") return user.role === 1;
      if (role === "customer") return user.role === 2;
      return user.role === role;
    });
  };

  const isAdmin = () => {
    return hasRole("admin");
  };

  const isCustomer = () => {
    return hasRole("customer");
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

