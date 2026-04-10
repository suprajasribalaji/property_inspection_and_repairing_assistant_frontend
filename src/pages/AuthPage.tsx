import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "@/services/api";
import { toast } from "sonner";
import heroImage from "@/assets/hero-inspection.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000";

const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { id: "special", label: "One special character (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const getStrength = (p: string) => passwordRules.filter(r => r.test(p)).length;

const strengthConfig = [
  { label: "", color: "bg-border" },
  { label: "Very Weak", color: "bg-destructive" },
  { label: "Weak", color: "bg-orange-400" },
  { label: "Fair", color: "bg-yellow-400" },
  { label: "Good", color: "bg-lime-500" },
  { label: "Strong", color: "bg-green-500" },
];

const emailRules = [
  { id: "at", label: "Contains @ symbol", test: (e: string) => e.includes("@") },
  { id: "local", label: "Characters before @", test: (e: string) => /^[^@]+@/.test(e) },
  { id: "domain", label: "Domain name after @", test: (e: string) => /^[^@]+@[^@.]+/.test(e) },
  { id: "tld", label: "Valid extension (.com, .org...)", test: (e: string) => /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/.test(e) },
  { id: "nospace", label: "No spaces", test: (e: string) => e.length > 0 && !/\s/.test(e) },
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const navigate = useNavigate();

  // Debounce refs
  const emailTimeoutRef = useRef<NodeJS.Timeout>();
  const usernameTimeoutRef = useRef<NodeJS.Timeout>();

  const strength = getStrength(password);
  const isPasswordStrong = !isLogin ? strength === 5 : true;
  const isEmailValid = !isLogin ? emailRules.every(r => r.test(email)) : true;

  // Debounced email validation
  const validateEmail = useCallback(async (email: string) => {
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current);
    }

    emailTimeoutRef.current = setTimeout(async () => {
      if (!email) {
        setEmailError("");
        return;
      }

      if (!emailRules.every(r => r.test(email))) {
        setEmailError("Please enter a valid email address.");
        return;
      }

      // Check if email already exists (only on registration)
      if (!isLogin && emailRules.every(r => r.test(email))) {
        try {
          // API call to check email availability
          const response = await fetch(`${API_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`);
          const data = await response.json();
          if (data.exists) {
            setEmailError(`The email '${email}' is already registered.`);
          } else {
            setEmailError("");
          }
        } catch (error) {
          // If API fails, just clear error for valid format
          setEmailError("");
        }
      }
    }, 500); // 500ms delay
  }, [isLogin]);

  // Debounced username validation
  const validateUsername = useCallback(async (username: string) => {
    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    usernameTimeoutRef.current = setTimeout(async () => {
      if (!username) {
        setUsernameError("");
        return;
      }

      if (username.length < 3) {
        setUsernameError("Username must be at least 3 characters long.");
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setUsernameError("Username can only contain letters, numbers, and underscores.");
        return;
      }

      // Check if username already exists (only on registration)
      if (!isLogin) {
        try {
          // API call to check username availability
          const response = await fetch(`${API_BASE_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`);
          const data = await response.json();
          if (data.exists) {
            setUsernameError(`The username '${username}' is already taken.`);
          } else {
            setUsernameError("");
          }
        } catch (error) {
          // If API fails, just clear error for valid format
          setUsernameError("");
        }
      }
    }, 500); // 500ms delay
  }, [isLogin]);

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!isLogin && !isPasswordStrong) {
      setAuthError("Please create a stronger password before continuing.");
      return;
    }
    if (!isLogin && !isEmailValid) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser({ email, password });
        localStorage.setItem("authToken", data.access_token);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const data = await registerUser({ username: name, email, password });
        localStorage.setItem("authToken", data.access_token);
        toast.success("Account created successfully!");
        navigate("/");
      }
    } catch (error: unknown) {
      let errorMessage = "Authentication failed. Please check your credentials.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
          <Button
            type="button"
            variant="default"
            size="lg"
            className="px-8"
            onClick={() => { setIsLogin((v) => !v); setAuthError(""); }}
          >
            {isLogin ? "Create Account" : "Get Started"}
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
            {isLogin
              ? "Sign in to your account."
              : "Create Your Account, It's Free."}
          </p>

          {/* Inline error banner */}
          {authError && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">{isLogin ? "Please ensure you have an account!" : "Ensure you followed all the field's rules!"}</p>
                <p className="text-destructive/80 text-xs mt-0.5">{authError}</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthError("")}
                className="ml-auto shrink-0 text-destructive/60 hover:text-destructive transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name">User Name</Label>
                <Input 
                  id="name" 
                  placeholder="username" 
                  value={name} 
                  onChange={e => { 
                    setName(e.target.value); 
                    setAuthError(""); 
                    validateUsername(e.target.value);
                  }} 
                  required 
                  className={usernameError ? "border-destructive" : ""}
                />
                {usernameError && (
                  <p className="text-xs text-destructive mt-1">{usernameError}</p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email ID</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { 
                    setEmail(e.target.value); 
                    setAuthError(""); 
                    validateEmail(e.target.value);
                  }}
                  required
                  className={`${email.length > 0 ? "pr-10" : ""} ${emailError ? "border-destructive" : ""}`}
                />
                {email.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {emailError ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : (
                      /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)
                        ? <Check className="h-4 w-4 text-green-500" />
                        : <X className="h-4 w-4 text-destructive" />
                    )}
                  </span>
                )}
                {emailError && (
                  <p className="text-xs text-destructive mt-1">{emailError}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter – only shown on signup */}
              {!isLogin && password.length > 0 && (
                <div className="mt-3 space-y-2">
                  {/* Segmented bar */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthConfig[strength].color : "bg-border"
                          }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength <= 1 ? "text-destructive" :
                    strength === 2 ? "text-orange-400" :
                      strength === 3 ? "text-yellow-500" :
                        strength === 4 ? "text-lime-600" : "text-green-600"
                    }`}>
                    {strengthConfig[strength].label}
                  </p>

                  {/* Per-rule checklist */}
                  <ul className="space-y-1">
                    {passwordRules.map(rule => {
                      const passed = rule.test(password);
                      return (
                        <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${passed ? "text-green-600" : "text-muted-foreground"
                          }`}>
                          {passed
                            ? <Check className="h-3 w-3 shrink-0" />
                            : <X className="h-3 w-3 shrink-0" />}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          {/* Mobile toggle */}
          <p className="mt-6 text-center text-sm text-muted-foreground lg:hidden">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setIsLogin((v) => !v); setAuthError(""); }}
              className="font-medium text-primary underline-offset-2 hover:underline"
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

export default AuthPage;
