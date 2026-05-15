import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, ArrowRight, Loader2, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export default function Login() {
  const navigate = useNavigate();
  const { login, authenticated, ready } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      navigate("/dashboard");
    }
  }, [ready, authenticated, setLocation]);

  if (!ready) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background overflow-hidden relative selection:bg-primary/20 selection:text-primary">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 px-6 justify-center pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm border border-primary/20">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground text-center">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-2 text-center text-base">
            Sign in to your Susu account
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="space-y-5"
        >
          <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">One-time email code</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter your email and we send a secure code. No password needed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Bank-grade security</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your account is protected and your money is safely stored.
                </p>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            onClick={login}
            data-testid="button-signin"
          >
            Sign In with Email
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          New to Susu?{" "}
          <Link
            href="/"
            className="text-primary font-medium hover:underline"
            data-testid="link-create-account"
          >
            Create account
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
