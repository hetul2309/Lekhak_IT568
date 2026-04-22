import { useState } from "react";
import { Mail, User, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validation
  const validate = (data: typeof form) => {
    let newErrors: typeof errors = {};

    const nameRegex = /^[A-Za-zÀ-ÿ' -]{2,100}$/;
    if (!nameRegex.test(data.name.trim())) {
      newErrors.name = "Enter a valid name (2–100 characters)";
    }

    const usernameRegex = /^(?=.*[a-z])[a-z0-9._]{3,20}$/;
    if (!usernameRegex.test(data.username)) {
      newErrors.username =
        "Username must be 3–20 chars and include at least one letter";
    }
    if (/(\.\.|__)/.test(data.username)) {
      newErrors.username = "No consecutive dots or underscores";
    }
    if (/^[._]|[._]$/.test(data.username)) {
      newErrors.username = "Cannot start or end with . or _";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (data.password.length < 8 || data.password.length > 16) {
      newErrors.password = "Password must be 8–16 characters";
    }

    if (data.password !== data.confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    return newErrors;
  };

  // Handle Change
  const handleChange = (field: keyof typeof form, value: string) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    setErrors(validate(updatedForm));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-sm"
      >

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-primary">Lekhak</h1>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Create your account
          </h2>
        </div>

        {/* Google Signup */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-[var(--border)] rounded-xl py-2.5 hover:bg-[var(--muted)] transition"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          <span className="text-sm font-medium text-[var(--foreground)]">
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-[var(--border)]"></div>
          <span className="text-xs text-[var(--muted-foreground)]">or</span>
          <div className="flex-1 border-t border-[var(--border)]"></div>
        </div>

        {/* Name */}
        <div>
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.name
                ? "border-red-500"
                : form.name
                ? "border-green-500"
                : "border-[var(--border)]"
            } bg-[var(--input-background)]`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.username
                ? "border-red-500"
                : form.username
                ? "border-green-500"
                : "border-[var(--border)]"
            } bg-[var(--input-background)]`}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.email
                ? "border-red-500"
                : form.email
                ? "border-green-500"
                : "border-[var(--border)]"
            } bg-[var(--input-background)]`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${
                errors.password
                  ? "border-red-500"
                  : form.password
                  ? "border-green-500"
                  : "border-[var(--border)]"
              } bg-[var(--input-background)]`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-[var(--muted-foreground)]"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={form.confirm}
              onChange={(e) => handleChange("confirm", e.target.value)}
              className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${
                errors.confirm
                  ? "border-red-500"
                  : form.confirm
                  ? "border-green-500"
                  : "border-[var(--border)]"
              } bg-[var(--input-background)]`}
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-3 flex items-center text-[var(--muted-foreground)]"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {errors.confirm && (
            <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold"
        >
          Sign up
        </button>

        {/* Footer */}
        <p className="text-sm text-center text-[var(--muted-foreground)]">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </p>

      </form>
    </div>
  );
}

export default Signup;