import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background overflow-hidden relative selection:bg-primary/20 selection:text-primary">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 px-6 py-12 justify-between">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-2 pt-4"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">Susu</span>
        </motion.header>

        <main className="flex-1 flex flex-col justify-center mt-12 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe, secure, and yours.</span>
            </div>
            
            <h1 className="text-5xl font-extrabold text-foreground leading-[1.1] tracking-tight mb-4">
              Your money,<br />
              <span className="text-primary">growing safely.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join the modern savings circle. Build your wealth with the calm confidence of a community that has your back.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="space-y-4"
          >
            <Link to="/login" className="block w-full">
              <Button size="lg" className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300" data-testid="button-get-started">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline" data-testid="link-login">Log in</Link>
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
