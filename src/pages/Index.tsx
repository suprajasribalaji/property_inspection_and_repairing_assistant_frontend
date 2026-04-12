import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-inspection.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useInspection } from "@/context/InspectionContext";
import { login, register, checkEmailExists, checkUsernameExists } from "@/services/api";
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react";

type FieldStatus = "idle" | "checking" | "available" | "taken";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Uniqueness check state
  const [emailStatus, setEmailStatus] = useState<FieldStatus>("idle");
  const [usernameStatus, setUsernameStatus] = useState<FieldStatus>("idle");

  const emailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setUser } = useInspection();
  const navigate = useNavigate();

  // ── Debounced email check ─────────────────────────────
  useEffect(() => {
    if (isLogin) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus("idle");
      return;
    }

    setEmailStatus("checking");

    if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    emailTimerRef.current = setTimeout(async () => {
      try {
        const exists = await checkEmailExists(email);
        setEmailStatus(exists ? "taken" : "available");
      } catch {
        setEmailStatus("idle");
      }
    }, 600); // 600ms after stopped typing

    return () => {
      if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    };
  }, [email, isLogin]);

  // ── Debounced username check ──────────────────────────
  useEffect(() => {
    if (isLogin) return;
    if (!username || username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");

    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const exists = await checkUsernameExists(username);
        setUsernameStatus(exists ? "taken" : "available");
      } catch {
        setUsernameStatus("idle");
      }
    }, 600);

    return () => {
      if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
    };
  }, [username, isLogin]);

  // Reset status when switching forms
  const handleToggle = () => {
    setIsLogin((v) => !v);
    setError("");
    setEmailStatus("idle");
    setUsernameStatus("idle");
    setEmail("");
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Block submit if fields are taken
    if (!isLogin) {
      if (emailStatus === "taken") {
        setError("This email is already registered.");
        return;
      }
      if (usernameStatus === "taken") {
        setError("This username is already taken.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (username.length < 3) {
        setError("Username must be at least 3 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await login(email, password);
      } else {
        response = await register({ email, username, password });
      }

      localStorage.setItem("access_token", response.access_token);
      setUser(response.user);
      navigate("/home");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Something went wrong");
      } else {
        setError(detail || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Field status icon ─────────────────────────────────
  const FieldIcon = ({ status }: { status: FieldStatus }) => {
    if (status === "checking") return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (status === "available") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === "taken") return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  const fieldMessage = (status: FieldStatus, takenMsg: string, availableMsg: string) => {
    if (status === "taken") return <p className="mt-1 text-xs text-red-500">{takenMsg}</p>;
    if (status === "available") return <p className="mt-1 text-xs text-green-500">{availableMsg}</p>;
    return null;
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Hero */}
      <div className="relative hidden w-3/5 lg:block">
        <img
          src={heroImage}
          alt="Property inspector at work"
          className="absolute inset-0 h-full w-full object-cover"
          width={960}
          height={1080}
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-primary">
            Welcome Back
          </p>
          <h1 className="mb-6 text-4xl text-card md:text-5xl">
            Property Inspection
          </h1>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-muted">
            Streamline your property inspections with our comprehensive platform.
            Schedule, inspect, and report — all in one place.
          </p>
          <Button variant="default" size="lg" className="px-8" onClick={handleToggle}>
            {isLogin ? "Create Account" : "Sign In"}
          </Button>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex w-full flex-col justify-between bg-card px-8 py-12 lg:w-2/5 lg:px-14">
        <div className="mx-auto w-full max-w-sm flex-1 flex flex-col justify-center">
          <h2 className="mb-1 text-2xl font-bold text-card-foreground">
            {isLogin ? "Welcome Back" : "Join Us"}
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            {isLogin ? "Sign in to your account." : "Create Your Account, It's Free."}
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className={
                      usernameStatus === "taken"
                        ? "border-red-400 pr-8"
                        : usernameStatus === "available"
                        ? "border-green-400 pr-8"
                        : "pr-8"
                    }
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <FieldIcon status={usernameStatus} />
                  </div>
                </div>
                {fieldMessage(usernameStatus, "Username already taken", "Username is available ✓")}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={
                    !isLogin && emailStatus === "taken"
                      ? "border-red-400 pr-8"
                      : !isLogin && emailStatus === "available"
                      ? "border-green-400 pr-8"
                      : "pr-8"
                  }
                />
                {!isLogin && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <FieldIcon status={emailStatus} />
                  </div>
                )}
              </div>
              {!isLogin && fieldMessage(emailStatus, "Email already registered", "Email is available ✓")}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                loading ||
                (!isLogin && (emailStatus === "taken" || usernameStatus === "taken" || emailStatus === "checking" || usernameStatus === "checking"))
              }
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={handleToggle}
              className="font-medium text-primary-foreground underline-offset-2 hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © 2026 PropertyInspect. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;