import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const params = new URLSearchParams(location.search);
  const next = params.get("next") || "/";

  if (!isLoading && isAuthenticated) {
    return <Navigate to={next} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      toast({
        variant: "success",
        title: "Welcome back",
        description: "You are now signed in.",
      });
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,114,35,0.16),_transparent_35%),linear-gradient(180deg,rgba(255,248,240,0.92),rgba(255,255,255,1))] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:block space-y-6 pr-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
            <PenSquare className="h-4 w-4 text-primary" />
            Writer-first publishing, now with real accounts
          </div>
          <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight">
            Sign in to publish, like, and comment with your own Lekhak account.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Your session now persists across refreshes, so we can connect the frontend to the backend like a real app instead of a mock.
          </p>
        </section>

        <Card className="w-full max-w-md border-border/60 bg-background/90 shadow-card backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle>Login</CardTitle>
            <CardDescription>Use your registered email and password to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Could not sign in</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? "Signing in..." : "Login"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link to={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Login;
