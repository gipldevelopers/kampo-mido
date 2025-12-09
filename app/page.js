"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import AuthService from "@/services/auth.service";
import Toast from "@/components/Toast";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [loginInput, setLoginInput] = useState(""); // Can be email or phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);

    try {
      // Determine if input is email or phone
      const isEmail = loginInput.includes("@");
      const credentials = {
        password,
      };

      if (isEmail) {
        credentials.email = loginInput;
      } else {
        credentials.phone = loginInput;
      }

      // Call login API
      const { user, token } = await AuthService.login(credentials);

      // Validate user object exists
      if (!user) {
        setToast({ message: "Login failed: No user data received", type: "error" });
        return;
      }

      // Update user context
      login(user);

      // Redirect based on role from API response
      // Role is a string: "admin" or "customer"
      const role = user.role?.toLowerCase();

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "customer") {
        router.push("/customers/dashboard");
      } else {
        setToast({ message: `Invalid user role: ${user.role}`, type: "error" });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please try again.";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-card rounded-xl border border-border shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-muted-foreground">Enter your email/phone and password to access your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email or Phone</label>
            <input
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your email or phone number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 pr-10 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link href="/auth/forgot-password" className="text-muted-foreground hover:text-primary transition-colors">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}