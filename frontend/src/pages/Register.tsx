import { useState } from "react";
import { Mail, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (data: typeof form) => {
    let newErrors: any = {};

    if (!data.name) newErrors.name = "Name required";
    if (!data.username) newErrors.username = "Username required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      newErrors.email = "Invalid email";
    }

    if (data.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }

    if (data.password !== data.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setErrors(validate(updated));
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.name,
      });
      navigate("/");
    } catch (err) {
      toast({
        title: "Sign up failed",
        description: err instanceof Error ? err.message : "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6">

        <div className="text-center">
          <h1 className="text-3xl font-semibold text-primary">Lekhak</h1>
          <h2 className="text-xl">Create your account</h2>
        </div>

        <button type="button" onClick={handleGoogleSignup} className="w-full flex items-center justify-center gap-2 border rounded-xl py-2.5">
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t"></div>
          <span className="text-xs">or</span>
          <div className="flex-1 border-t"></div>
        </div>

        <input
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => handleChange("username", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border"
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

        <div className="relative">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-2.5 pr-10 rounded-xl border"
          />
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="w-full px-4 py-2.5 pr-10 rounded-xl border"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            value={form.confirm}
            onChange={(e) => handleChange("confirm", e.target.value)}
            className="w-full px-4 py-2.5 pr-10 rounded-xl border"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showConfirm ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}

        <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-gradient-primary text-white font-semibold disabled:opacity-60">
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary">
            Login
          </Link>
        </p>

      </form>
    </div>
  );
};

export default Register;