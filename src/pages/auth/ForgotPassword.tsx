import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    const { error: resetError } = await resetPassword(email.trim());

    if (!resetError) {
      setIsEmailSent(true);
    } else {
      setError(resetError);
    }

    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background text-foreground p-4 sm:p-6 transition-colors duration-300">
      {/* Background Ambient Glow Accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[460px] w-[460px] rounded-full bg-blue-600/15 dark:bg-blue-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 dark:bg-indigo-600/20 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-card border border-border/60 shadow-2xl dark:shadow-black/50 backdrop-blur-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="font-heading font-extrabold text-xl text-foreground">BrickWealth</span>
          </div>

          {isEmailSent ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-foreground">Check Your Inbox</h2>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                We've sent password reset instructions to{" "}
                <span className="text-foreground font-semibold">{email}</span>.
              </p>
              <div className="flex gap-3 pt-4 w-full">
                <Button
                  variant="outline"
                  onClick={() => setIsEmailSent(false)}
                  className="flex-1 rounded-xl border-border/60 text-foreground hover:bg-muted"
                >
                  Resend
                </Button>
                <Link to="/login" className="flex-1">
                  <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-heading font-extrabold text-foreground">
                  Reset Password
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your email address and we'll send you a link to reset your account credentials.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-300">
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

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Instructions...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
