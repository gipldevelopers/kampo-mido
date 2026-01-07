"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import AuthService from "@/services/auth.service";
import Toast from "@/components/Toast";
import { Eye, EyeOff, Shield, Gem, Lock, User, Mail, Phone, ArrowRight, Sparkles, TrendingUp, Award } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useUser();
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("email");

  // Clear input when switching tabs
  useEffect(() => {
    setLoginInput("");
    setToast(null);
  }, [activeTab]);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = AuthService.getStoredUser();
        const isAuthenticated = AuthService.isAuthenticated();

        if (storedUser && isAuthenticated) {
          const role = storedUser.role?.toLowerCase();
          if (role === "admin") {
            router.push("/admin/dashboard");
          } else if (role === "customer") {
            router.push("/customers/dashboard");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        AuthService.logout();
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);

    try {
      const credentials = {
        password,
      };

      if (activeTab === "email") {
        credentials.email = loginInput.trim().toLowerCase();
      } else {
        credentials.phone = loginInput.trim();
      }

      const { user, token } = await AuthService.login(credentials);

      if (!user) {
        setToast({ message: "Login failed: No user data received", type: "error" });
        return;
      }

      login(user);
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-rose-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
            <Gem className="absolute inset-0 m-auto w-8 h-8 text-amber-600 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Verifying your credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4 relative overflow-y-auto">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-200/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      {toast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 my-auto">

        {/* Left Column - Image Gallery */}
        <div className="relative p-6 lg:p-8 bg-gradient-to-br from-amber-50 to-rose-50 flex flex-col justify-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-12 h-12 rounded-lg shadow-lg overflow-hidden">
              <Image
                src="/logo/logo.jpeg"
                alt="Kampo Mido Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kampo Mido</h1>
              <p className="text-xs text-gray-600">Digital Gold Platform</p>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative mb-6">
            <div className="h-40 w-full rounded-xl overflow-hidden shadow-xl border-2 border-white">
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <div className="text-center p-4">
                  <Gem className="w-12 h-12 text-white/90 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white mb-1">Pure Gold</h3>
                  <p className="text-white/80 text-xs">Secure & Transparent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-md">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-xs">Secure</h4>
                  <p className="text-[10px] text-gray-600">Bank-grade</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-md">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-xs">Live Rates</h4>
                  <p className="text-[10px] text-gray-600">Real-time stats</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-md">
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-xs">Certified</h4>
                  <p className="text-[10px] text-gray-600">BIS Hallmarked</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-md">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-xs">Growth</h4>
                  <p className="text-[10px] text-gray-600">Smart returns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-4 rounded-xl border border-amber-200/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RS</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-amber-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic text-xs mb-1">
                  "Started with ₹10k, now porfolio is ₹85k. Best decision!"
                </p>
                <p className="text-xs font-semibold text-gray-900">Rajesh Sharma</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="p-6 lg:p-8 bg-white flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Brand */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="relative w-10 h-10 rounded-md overflow-hidden">
                <Image
                  src="/logo/logo.jpeg"
                  alt="Kampo Mido Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Kampo Mido</h1>
              </div>
            </div>

            <div className="space-y-5">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
                <p className="text-sm text-gray-600">Access your gold portfolio</p>
              </div>

              {/* Login Tabs */}
              <div className="bg-gray-50 rounded-xl p-1">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setActiveTab("email")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "email"
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("phone")}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "phone"
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Phone</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username/Email/Phone Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 ml-1">
                    {activeTab === "email" ? "Email Address" : "Phone Number"}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      {activeTab === "email" ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </div>
                    <input
                      type={activeTab === "email" ? "email" : "tel"}
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300 placeholder:text-gray-400"
                      placeholder={activeTab === "email" ? "you@example.com" : "9876543210"}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700 ml-1">Password</label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300 placeholder:text-gray-400"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:opacity-95 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Note */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-gray-600">
                    Your data is protected with bank-level encryption.
                  </p>
                </div>
              </div>

              {/* Demo Credentials - Compact */}
              <div className="pt-4 border-t border-gray-200">
                <p className="font-medium text-gray-900 text-xs mb-2">Demo Access:</p>
                <div className="flex gap-2 text-[10px] text-gray-500">
                  <div className="flex-1 bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-700 block">Admin</span>
                    admin@goldinvestment.com<br />Admin@123
                  </div>
                  <div className="flex-1 bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="font-semibold text-gray-700 block">Customer</span>
                    rajesh.customer@example.com<br />cus1@123
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}