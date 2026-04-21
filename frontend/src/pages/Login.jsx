import { useState } from "react";
import { CiMail } from "react-icons/ci";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      {/* Card */}
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-sm">

        {/* Logo / Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-primary">Lekhak</h1>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Welcome back
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Continue your writing journey
          </p>
        </div>

        {/* Google Login */}
        <button className="w-full flex items-center justify-center gap-2 border border-[var(--border)] rounded-xl py-2.5 hover:bg-[var(--muted)] transition">
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

        {/* Form */}
        <div className="space-y-4">

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--border)] bg-[var(--input-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <CiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--border)] bg-[var(--input-background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />

            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <span className="text-sm text-primary cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-md transition hover:opacity-90"
          >
            Sign in
          </button>

        </div>

        {/* Footer */}
        <p className="text-sm text-center text-[var(--muted-foreground)]">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-medium hover:underline"
        >
            Sign up
            </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
