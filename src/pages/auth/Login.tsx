import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  TrendingUp,
  Shield,
  Layers,
  BarChart3,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const isDark = mounted ? (resolvedTheme || theme) === "dark" : true;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    if (!error) navigate("/");
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    const { error } = await signUp(email.trim(), password, fullName);
    if (!error) navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    setIsLoading(false);
  };

  const fillSuperadmin = () => {
    setEmail("Superadmin@gmail.com");
    setPassword("123456");
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background text-foreground selection:bg-primary/30 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Background Ambient Glow Accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue-600/15 dark:bg-blue-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[560px] w-[560px] rounded-full bg-indigo-600/15 dark:bg-indigo-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[680px] w-[680px] rounded-full bg-sky-500/8 dark:bg-sky-500/10 blur-[160px]" />

      {/* Subtle Grid Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="absolute top-5 right-5 z-20 h-9 w-9 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {mounted && isDark ? (
          <Sun className="h-4 w-4 text-amber-500" />
        ) : (
          <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        )}
      </button>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Showcase */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl text-xs font-semibold text-primary shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>Next-Gen Wealth Intelligence</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">
                  BrickWealth
                </h1>
              </div>
              <p className="text-2xl font-semibold text-foreground/80 tracking-tight leading-snug">
                Precision portfolio tracking for modern investors & advisors.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Unified analytics across mutual funds, real estate, gold, derivatives, and capital
                gains with automated XIRR computation.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-3 pt-2">
              {[
                { icon: BarChart3, color: "text-blue-500 bg-blue-500/10", title: "Consolidated Net Worth", desc: "Real-time valuation across all investment classes" },
                { icon: Layers, color: "text-indigo-500 bg-indigo-500/10", title: "Multi-Asset Architecture", desc: "Equity, mutual funds, gold holdings, & rental yields" },
                { icon: Shield, color: "text-emerald-500 bg-emerald-500/10", title: "Role-Based Security", desc: "Enterprise access control and KYC verification" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/40 backdrop-blur-md">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                    <f.icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-foreground">{f.title}</div>
                    <div className="text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Institutional Grade</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Instant Portfolio Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Automated P&L</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="w-full lg:col-span-6">
          <div className="relative rounded-3xl bg-card border border-border/60 shadow-2xl dark:shadow-black/50 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden">
            {/* Top Glow Edge */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />

            <div className="mb-6 space-y-1">
              <div className="lg:hidden flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-foreground">BrickWealth</span>
              </div>
              <h2 className="text-2xl font-heading font-extrabold tracking-tight text-foreground">
                Access your portfolio
              </h2>
              <p className="text-xs text-muted-foreground">
                Sign in with your credentials to manage wealth, assets & insights.
              </p>
            </div>

            {/* Quick Demo Credentials */}
            <div className="mb-5 p-3 rounded-2xl bg-primary/8 border border-primary/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-primary/80 font-medium truncate">Quick SuperAdmin Fill</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillSuperadmin}
                className="h-7 px-2.5 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 rounded-lg transition-all"
              >
                Autofill
              </Button>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60 rounded-xl border border-border/40 mb-6">
                <TabsTrigger
                  value="login"
                  className="rounded-lg text-xs font-semibold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg text-xs font-semibold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  New Account
                </TabsTrigger>
              </TabsList>

              {/* Sign In Form */}
              <TabsContent value="login" className="space-y-4 focus-visible:outline-none">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-foreground/80">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-10 h-11 bg-muted/50 border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-medium text-foreground/80">
                        Password
                      </Label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-10 pr-10 h-11 bg-muted/50 border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Form */}
              <TabsContent value="signup" className="space-y-4 focus-visible:outline-none">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-xs font-medium text-foreground/80">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 h-11 bg-muted/50 border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs font-medium text-foreground/80">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-10 h-11 bg-muted/50 border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs font-medium text-foreground/80">
                      Create Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        minLength={6}
                        className="pl-10 h-11 bg-muted/50 border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-5 border-t border-border/50 text-center text-[11px] text-muted-foreground">
              Encrypted end-to-end with enterprise AES-256 session protection.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

