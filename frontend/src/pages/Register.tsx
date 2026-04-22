import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { register, isAuthenticated, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
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
      await register({
        displayName: displayName || username,
        username,
        email,
        password,
      });
      toast({
        variant: "success",
        title: "Account created",
        description: "You are ready to start writing.",
      });
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(180deg,rgba(255,251,235,0.92),rgba(255,255,255,1))] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:block space-y-6 pr-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            Join the writing community
          </div>
          <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight">
            Create your account and make the frontend feel like a real product.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Registration now stores your session locally, restores it on refresh, and unlocks authenticated actions like publishing, liking, and commenting.
          </p>
        </section>

        <Card className="w-full max-w-md border-border/60 bg-background/90 shadow-card backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle>Create account</CardTitle>
            <CardDescription>Choose a username, add your email, and start writing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Could not create account</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How readers will see you"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="writername"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? "Creating account..." : "Register"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Register;
