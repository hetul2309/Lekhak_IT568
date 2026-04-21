import { useState } from "react";
import { CiMail, CiUser } from "react-icons/ci";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
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

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validation
  const validate = (data) => {
    let newErrors = {};

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
  const handleChange = (field, value) => {
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-sm"
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
          <FcGoogle size={20} />
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
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
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
              {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
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
          <Link to="/" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </form>
    </div>
  );
}

export default Signup;
