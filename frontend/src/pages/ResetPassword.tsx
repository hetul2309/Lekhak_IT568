import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage("Password reset successful. You can now log in.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Failed to reset password");
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
          <h1 className="text-2xl font-semibold text-primary">Set New Password</h1>
          <p className="text-sm text-muted-foreground">
            Please enter your new password below.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--border)] bg-background"
            />
            <Lock size={20} className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--border)] bg-background"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          {message && <p className="text-green-500 text-sm mt-1">{message}</p>}

          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold disabled:opacity-70 shadow-glow">
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </div>
        <div className="text-center pt-2">
          <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;