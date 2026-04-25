import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'bloglekhak2629@gmail.com' && password === 'admin@1234') {
      localStorage.setItem('isAdminAuth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-sm">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-primary">Lekhak Admin</h1>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Login to portal
          </h2>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>}

        <div className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="email"
                placeholder="Admin Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--border)] bg-transparent focus:outline-none"
              />
              <Mail size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--border)] bg-transparent focus:outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold"
          >
            Sign In to Admin
          </button>
        </div>

        <div className="pt-4 border-t border-[var(--border)] text-center">
          <Link to="/login" className="text-sm font-semibold text-[var(--muted-foreground)] hover:text-primary transition-colors">
            ← Back to User Login
          </Link>
        </div>
      </form>
    </div>
  );
}