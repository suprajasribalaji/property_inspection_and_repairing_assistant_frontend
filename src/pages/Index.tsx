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

// ── Types ─────────────────────────────────────────────────
type FieldStatus = "idle" | "checking" | "available" | "taken";
type PasswordStrength = "empty" | "weak" | "fair" | "strong";

// ── Password helpers ──────────────────────────────────────
const getPasswordStrength = (pwd: string): PasswordStrength => {
  if (!pwd) return "empty";
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  return "strong";
};

const passwordRules = (pwd: string) => [
  { label: "At least 8 characters",          met: pwd.length >= 8 },
  { label: "At least one uppercase letter",   met: /[A-Z]/.test(pwd) },
  { label: "At least one number",             met: /[0-9]/.test(pwd) },
  { label: "At least one special character",  met: /[^A-Za-z0-9]/.test(pwd) },
];

// ── Email format checker ──────────────────────────────────
const isValidEmailFormat = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// ── Field status icon ─────────────────────────────────────
const FieldIcon = ({ status }: { status: FieldStatus }) => {
  if (status === "checking")  return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  if (status === "available") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "taken")     return <XCircle className="h-4 w-4 text-red-500" />;
  return null;
};

const fieldMessage = (status: FieldStatus, takenMsg: string, availableMsg: string) => {
  if (status === "taken")     return <p className="mt-1 text-xs text-red-500">{takenMsg}</p>;
  if (status === "available") return <p className="mt-1 text-xs text-green-500">{availableMsg}</p>;
  return null;
};

// ─────────────────────────────────────────────────────────
const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState<FieldStatus>("idle");
  const [usernameStatus, setUsernameStatus] = useState<FieldStatus>("idle");
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>("empty");

  const emailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setUser } = useInspection();
  const navigate = useNavigate();

  // ── Debounced email check ─────────────────────────────
  useEffect(() => {
    if (isLogin) return;
    if (!email || !isValidEmailFormat(email)) { setEmailStatus("idle"); return; }
    setEmailStatus("checking");
    if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    emailTimerRef.current = setTimeout(async () => {
      try {
        const exists = await checkEmailExists(email);
        setEmailStatus(exists ? "taken" : "available");
      } catch { setEmailStatus("idle"); }
    }, 600);
    return () => { if (emailTimerRef.current) clearTimeout(emailTimerRef.current); };
  }, [email, isLogin]);

  // ── Debounced username check ──────────────────────────
  useEffect(() => {
    if (isLogin) return;
    if (!username || username.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const exists = await checkUsernameExists(username);
        setUsernameStatus(exists ? "taken" : "available");
      } catch { setUsernameStatus("idle"); }
    }, 600);
    return () => { if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current); };
  }, [username, isLogin]);

  // ── Toggle form ───────────────────────────────────────
  const handleToggle = () => {
    setIsLogin((v) => !v);
    setLoginError("");      
    setSignupError("");
    setEmailStatus("idle");
    setUsernameStatus("idle");
    setEmail("");
    setUsername("");
    setPassword("");
    setPasswordStrength("empty");
    setShowPassword(false);
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSignupError("");

    if (!isLogin) {
      if (!isValidEmailFormat(email))  { setSignupError("Please enter a valid email address."); return; }
      if (emailStatus === "taken")     { setSignupError("This email is already registered."); return; }
      if (usernameStatus === "taken")  { setSignupError("This username is already taken."); return; }
      if (username.length < 3)         { setSignupError("Username must be at least 3 characters."); return; }
      if (passwordStrength === "weak") { setSignupError("Please choose a stronger password."); return; }
    }

    setLoading(true);
    try {
      const response = isLogin
        ? await login(email, password)
        : await register({ email, username, password });
      localStorage.setItem("access_token", response.access_token);
      setUser(response.user);
      navigate("/home");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail) ? detail[0]?.msg : detail || "Something went wrong. Please try again.";
      if (isLogin) {
        setLoginError(message);
      } else {
        setSignupError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Strength helpers ──────────────────────────────────
  const strengthColor =
    passwordStrength === "weak"   ? "#ef4444" :
    passwordStrength === "fair"   ? "#f59e0b" :
    passwordStrength === "strong" ? "#22c55e" :
    "var(--color-border-tertiary)";

  const strengthBarFill = (i: number) => {
    if (passwordStrength === "empty")               return "var(--color-border-tertiary)";
    if (passwordStrength === "weak"   && i === 0)   return "#ef4444";
    if (passwordStrength === "fair"   && i <= 1)    return "#f59e0b";
    if (passwordStrength === "strong")              return "#22c55e";
    return "var(--color-border-tertiary)";
  };

  return (
    <div className="flex min-h-screen">

      {/* ── Left Hero ────────────────────────────────── */}
      <div className="relative hidden w-[54%] lg:block flex-shrink-0">
        <img
          src={heroImage}
          alt="Property inspector at work"
          className="absolute inset-0 h-full w-full object-cover object-center"
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

      {/* ── Right Form ───────────────────────────────── */}
      <div className="flex w-full flex-col bg-card px-8 py-12 lg:w-[46%] lg:px-14 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm flex-1 flex flex-col justify-center">

          <h2 className="mb-1 text-2xl font-bold text-card-foreground">
            {isLogin ? "Welcome Back" : "Join Us"}
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            {isLogin ? "Sign in to your account." : "Create Your Account, It's Free."}
          </p>

          {/* Error banner */}
          {(isLogin ? loginError : signupError) && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {isLogin ? loginError : signupError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* ── Username ── */}
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
                      usernameStatus === "taken"     ? "border-red-400 pr-9" :
                      usernameStatus === "available" ? "border-green-400 pr-9" : "pr-9"
                    }
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <FieldIcon status={usernameStatus} />
                  </div>
                </div>
                {fieldMessage(usernameStatus, "Username already taken", "Username is available ✓")}
              </div>
            )}

            {/* ── Email ── */}
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
                    !isLogin && emailStatus === "taken"     ? "border-red-400 pr-9" :
                    !isLogin && emailStatus === "available" ? "border-green-400 pr-9" : "pr-9"
                  }
                />
                {!isLogin && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <FieldIcon status={emailStatus} />
                  </div>
                )}
              </div>
              {!isLogin && email && !isValidEmailFormat(email) && (
                <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
              )}
              {!isLogin && isValidEmailFormat(email) &&
                fieldMessage(emailStatus, "Email already registered", "Email is available ✓")}
            </div>

            {/* ── Password ── */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Pwd@#123"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordStrength(getPasswordStrength(e.target.value));
                  }}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />
                  }
                </button>
              </div>

              {/* Strength — signup only */}
              {!isLogin && password && (
                <div className="mt-2 space-y-2">
                  {/* Bar */}
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{ backgroundColor: strengthBarFill(i) }}
                      />
                    ))}
                  </div>
                  {/* Label */}
                  <p className="text-xs font-medium" style={{ color: strengthColor }}>
                    {passwordStrength === "weak"   && "Weak password"}
                    {passwordStrength === "fair"   && "Fair password"}
                    {passwordStrength === "strong" && "Strong password ✓"}
                  </p>
                  {/* Rules */}
                  <ul className="space-y-1">
                    {passwordRules(password).map((rule) => (
                      <li key={rule.label} className="flex items-center gap-1.5 text-xs">
                        <span style={{ color: rule.met ? "#22c55e" : "var(--color-text-tertiary)" }}>
                          {rule.met ? "✓" : "○"}
                        </span>
                        <span style={{ color: rule.met ? "#22c55e" : "var(--color-text-tertiary)" }}>
                          {rule.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── Submit ── */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                loading ||
                (!isLogin && (
                  emailStatus === "taken" ||
                  usernameStatus === "taken" ||
                  emailStatus === "checking" ||
                  usernameStatus === "checking" ||
                  passwordStrength === "weak" ||
                  (email.length > 0 && !isValidEmailFormat(email))
                ))
              }
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* ── Toggle ── */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={handleToggle}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PropertyInspect. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;