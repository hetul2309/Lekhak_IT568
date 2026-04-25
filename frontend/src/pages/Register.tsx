import { useState } from "react";
import { Mail, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { GoogleLogin } from "@react-oauth/google";
import { googleAuthRequest } from "@/lib/auth";

type RegisterForm = {
  name: string;
  username: string;
  email: string;
  password: string;
  confirm: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, refreshUser } = useAuth();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = (data: RegisterForm) => {
    const newErrors: RegisterErrors = {};

    const nameRegex = /^[\p{L}\s\-'.]+$/u;
    if (!data.name.trim()) {
      newErrors.name = "Name required";
    } else if (data.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (data.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    } else if (!nameRegex.test(data.name)) {
      newErrors.name = "Name can only contain letters, spaces, hyphens, apostrophes, and periods";
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        setSubmitting(true);
        await register({
          username: form.username,
          email: form.email,
          password: form.password,
          displayName: form.name,
        });
        const next = searchParams.get("next");
        const safeNext = next && /^\/[^/\\]/.test(next) ? next : "/";
        navigate(safeNext);
      } catch (error) {
        setErrors({
          email: error instanceof Error ? error.message : "Registration failed",
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setSubmitting(true);
      const data = await googleAuthRequest(credentialResponse.credential);

      if (data.token) {
        localStorage.setItem("token", data.token);
        await refreshUser();
        const next = searchParams.get("next");
        const safeNext = next && /^\/[^/\\]/.test(next) ? next : "/";
        navigate(safeNext);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google signup failed";
      setErrors({ email: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6">

        <div className="text-center">
          <h1 className="text-3xl font-semibold text-primary">Lekhak</h1>
          <h2 className="text-xl">Create your account</h2>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrors({ email: "Google Signup Failed" })}
          />
        </div>

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
          className={`w-full px-4 py-2.5 rounded-xl border ${form.name && !errors.name ? 'border-green-500' : ''}`}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => handleChange("username", e.target.value)}
          className={`w-full px-4 py-2.5 rounded-xl border ${form.username && !errors.username ? 'border-green-500' : ''}`}
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

        <div className="relative">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${form.email && !errors.email ? 'border-green-500' : ''}`}
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
            className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${form.password && !errors.password ? 'border-green-500' : ''}`}
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
            className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${form.confirm && !errors.confirm ? 'border-green-500' : ''}`}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showConfirm ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-gradient-primary text-white font-semibold disabled:opacity-70"
        >
          {submitting ? "Creating account..." : "Sign up"}
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
