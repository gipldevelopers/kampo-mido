"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-card rounded-xl border border-border shadow-lg">
        {!isSubmitted ? (
          <>
            {/* Header Section */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-primary">Reset Password</h1>
              <p className="text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="newPassword" 
                  className="text-sm font-medium text-foreground"
                >
                  New Password
                </label>
                <div className="relative">
                  {/* Icon on the left side */}
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <input 
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) {
                        setErrors({ ...errors, newPassword: "" });
                      }
                      if (errors.confirmPassword && e.target.value === confirmPassword) {
                        setErrors({ ...errors, confirmPassword: "" });
                      }
                    }}
                    required
                    // Adjusted padding-left (pl-11) and padding-right (pr-11) for icon spacing
                    className={`w-full pl-11 pr-11 py-2.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/70 transition-all ${
                      errors.newPassword ? "border-destructive" : "border-input"
                    }`}
                    placeholder="Enter your new password"
                  />
                  {/* Eye icon for toggling visibility */}
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors z-10"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword}</p>
                )}
                {!errors.newPassword && newPassword && (
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="confirmPassword" 
                  className="text-sm font-medium text-foreground"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  {/* Icon on the left side */}
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <input 
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: "" });
                      }
                    }}
                    required
                    // Adjusted padding-left (pl-11) and padding-right (pr-11) for icon spacing
                    className={`w-full pl-11 pr-11 py-2.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/70 transition-all ${
                      errors.confirmPassword ? "border-destructive" : "border-input"
                    }`}
                    placeholder="Confirm your new password"
                  />
                  {/* Eye icon for toggling visibility */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors z-10"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
                {!errors.confirmPassword && confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-primary">Passwords match</p>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center text-sm">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Password Updated!</h2>
              <p className="text-muted-foreground">
                Your password has been successfully updated. Redirecting to login...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}