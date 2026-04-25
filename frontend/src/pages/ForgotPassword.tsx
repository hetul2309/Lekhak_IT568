import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setSubmitting(true);
      // Note: Replace this URL with your actual backend API endpoint
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message || "If an account exists, a reset link has been sent.");
      } else {
        setError(data.message || "Failed to send password reset link");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
        
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-primary">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--border)] bg-background"
            />
            <Mail size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          {message && <p className="text-green-500 text-sm mt-1">{message}</p>}

          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold disabled:opacity-70 shadow-glow">
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </div>

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;