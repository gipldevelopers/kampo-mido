"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // Add authentication logic here
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border border-border shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-muted-foreground">Enter your credentials to access the admin panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-3 py-2 bg-input border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              placeholder="admin@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-3 py-2 bg-input border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
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
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}