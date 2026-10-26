import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, CheckCircle2, TrendingUp, Lock } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { updatePassword, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const validatePassword = (value: string) => {
    const errs: string[] = [];
    if (value.length < 8) errs.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(value)) errs.push("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(value)) errs.push("Password must contain at least one lowercase letter");
    if (!/[0-9]/.test(value)) errs.push("Password must contain at least one number");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      setErrors(["Passwords do not match"]);
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(password);

    if (!error) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setErrors([error]);
    }

    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 text-slate-100 p-4 sm:p-6">
      {/* Background Ambient Glow Accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[460px] w-[460px] rounded-full bg-blue-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl shadow-black/60 backdrop-blur-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="font-heading font-extrabold text-xl text-white">BrickWealth</span>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-white">Password Updated!</h2>
              <p className="text-xs text-slate-400">
                Your credentials have been securely updated. Redirecting to your portfolio...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-heading font-extrabold text-white">
                  Update Password
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose a strong, unique password to secure your wealth account.
                </p>
              </div>

              {errors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                  {errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-slate-300">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.length > 0) validatePassword(e.target.value);
                      }}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11 bg-slate-950/50 border-white/10 rounded-xl text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11 bg-slate-950/50 border-white/10 rounded-xl text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all"
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
                      Updating Password...
                    </>
                  ) : (
                    "Confirm & Set Password"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
