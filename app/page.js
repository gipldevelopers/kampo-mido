"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [role, setRole] = useState("1"); // 1 = Admin, 2 = Customer
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Mock authentication - In real app, validate against backend
    const userData = {
      id: role === "1" ? "admin-001" : "customer-001",
      email: email || (role === "1" ? "admin@kampomido.com" : "customer@example.com"),
      name: role === "1" ? "Admin User" : "Customer User",
      role: parseInt(role)
    };

    login(userData);

    // Redirect based on role
    if (role === "1") {
      router.push("/admin/dashboard");
    } else {
      router.push("/customers/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-card rounded-xl border border-border shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Login As</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("1")}
                className={`px-4 py-3 rounded-md border transition-all ${
                  role === "1"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input text-foreground hover:bg-muted"
                }`}
              >
                <div className="text-sm font-medium">Admin</div>
                <div className="text-xs opacity-80">Role 1</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("2")}
                className={`px-4 py-3 rounded-md border transition-all ${
                  role === "2"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input text-foreground hover:bg-muted"
                }`}
              >
                <div className="text-sm font-medium">Customer</div>
                <div className="text-xs opacity-80">Role 2</div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
              placeholder={role === "1" ? "admin@kampomido.com" : "customer@example.com"}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity shadow-sm"
          >
            Sign In
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