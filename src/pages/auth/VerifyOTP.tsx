import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, ShieldCheck, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// OTP length is defined here so it stays in sync with the form validation
const OTP_LENGTH = 6;

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email") || "";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) return;

    setIsLoading(true);
    const { error } = await verifyOTP(email, otp);
    setIsLoading(false);

    if (!error) {
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background text-foreground p-4 sm:p-6 transition-colors duration-300">
      {/* Background Ambient Glow Accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[460px] w-[460px] rounded-full bg-blue-600/15 dark:bg-blue-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 dark:bg-indigo-600/20 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-card border border-border/60 shadow-2xl dark:shadow-black/50 backdrop-blur-2xl p-6 sm:p-8 space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="font-heading font-extrabold text-xl text-foreground">BrickWealth</span>
          </div>

          {/* Heading */}
          <div className="space-y-1 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-400 mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-foreground">Security Verification</h1>
            <p className="text-xs text-muted-foreground">
              Enter the {OTP_LENGTH}-digit verification code sent to{" "}
              <span className="text-foreground font-semibold">{email || "your email"}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={OTP_LENGTH}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup className="gap-2">
                  {Array.from({ length: OTP_LENGTH }, (_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="h-12 w-11 rounded-xl bg-muted/50 border-border/60 text-foreground font-bold text-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-all"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-[0.99]"
              disabled={isLoading || otp.length !== OTP_LENGTH}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
