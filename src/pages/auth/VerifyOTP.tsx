import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, ShieldCheck, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email") || "";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    const { error } = await verifyOTP(email, otp);
    setIsLoading(false);

    if (!error) {
      navigate("/login");
    }
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

          <div className="space-y-1 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-white">Security Verification</h2>
            <p className="text-xs text-slate-400">
              Enter the 6-digit verification code sent to{" "}
              <span className="text-slate-200 font-semibold">{email || "your email"}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="h-12 w-11 rounded-xl bg-slate-950/60 border-white/10 text-white font-bold text-lg" />
                  <InputOTPSlot index={1} className="h-12 w-11 rounded-xl bg-slate-950/60 border-white/10 text-white font-bold text-lg" />
                  <InputOTPSlot index={2} className="h-12 w-11 rounded-xl bg-slate-950/60 border-white/10 text-white font-bold text-lg" />
                  <InputOTPSlot index={3} className="h-12 w-11 rounded-xl bg-slate-950/60 border-white/10 text-white font-bold text-lg" />
                  <InputOTPSlot index={4} className="h-12 w-11 rounded-xl bg-slate-950/60 border-white/10 text-white font-bold text-lg" />
                  <InputOTPSlot index={5} className="h-12 w-11 rounded-xl bg-slate-950/60 border-white/10 text-white font-bold text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Security Token...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
