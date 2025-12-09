"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react"; // Imported Mail icon

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = () => {
    if (!email) {
      setError("Email address is required");
      return false;
    }
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) {
        return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-card rounded-xl border border-border shadow-lg">
        {!isSubmitted ? (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-primary">Forgot Password?</h1>
              <p className="text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <div className="relative">
                  {/* Icon on the left side */}
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <input 
                    id="email"
                    type="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) {
                        setError("");
                      }
                    }}
                    required
                    // Adjusted padding-left (pl-11) for icon spacing
                    // Adjusted py-2.5 to match the password fields
                    className={`w-full pl-11 pr-3 py-2.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/70 transition-all ${
                        error ? "border-destructive" : "border-input"
                      }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !email} // Disable if loading or email is empty
                className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

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
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
              <p className="text-muted-foreground">
                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  // Optionally keep the email pre-filled: setEmail("");
                }}
                className="w-full py-2 bg-background border border-input text-foreground font-semibold rounded-md hover:bg-muted transition-colors"
              >
                Resend Email
              </button>

              <Link 
                href="/" 
                className="block w-full py-2 text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}