import { useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, refreshUser } = useAuth();

  const validate = (data: typeof form) => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    setErrors(validate(updatedForm));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        setSubmitting(true);
        await login(form.email, form.password);
        const next = searchParams.get("next");
        const safeNext = next && /^\/[^/\\]/.test(next) ? next : "/";
        navigate(safeNext);
      } catch (error) {
        setErrors({
          password: error instanceof Error ? error.message : "Login failed",
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId: credentialResponse.credential }),
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        await refreshUser();
        const next = searchParams.get("next");
        const safeNext = next && /^\/[^/\\]/.test(next) ? next : "/";
        navigate(safeNext);
      } else {
        setErrors({ password: data.message || "Google login failed" });
      }
    } catch (error) {
      console.error("Google auth fetch error:", error);
      setErrors({ password: "Network error during Google login" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-sm">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-primary">Lekhak</h1>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Login to your account
          </h2>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrors({ password: "Google Login Failed" })}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-[var(--border)]"></div>
          <span className="text-xs text-[var(--muted-foreground)]">or</span>
          <div className="flex-1 border-t border-[var(--border)]"></div>
        </div>

        <div className="space-y-4">

          <div>
            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--border)]"
              />
              <Mail size={20} className="absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--border)]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold disabled:opacity-70"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>

          <div className="text-center pt-2">
            <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              Forgot your password?
            </Link>
          </div>

        </div>

        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium">
            Sign up
          </Link>
        </p>

        <div className="pt-4 border-t border-[var(--border)]">
          <Link
            to="/admin/login"
            className="flex justify-center w-full py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Admin Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
