import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, TrendingUp, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/currency";
import { usePrivy } from "@privy-io/react-auth";
import { getUserBalance } from "@/lib/supabase";

const PLANS = [
  {
    id: "flex",
    name: "Flex Saver",
    apy: "4",
    label: "Low risk",
    labelColor: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    minDeposit: 5000,
    lockPeriod: "No lock-in",
    description: "Withdraw anytime. Ideal for emergency funds and short-term goals.",
    featured: false,
    suggestions: [5000, 10000, 20000, 50000],
    tip: "Great for beginners. Start small and grow.",
  },
  {
    id: "growth",
    name: "Growth Plan",
    apy: "6",
    label: "Recommended",
    labelColor: "text-primary bg-primary-foreground/20",
    minDeposit: 20000,
    lockPeriod: "90 days",
    description: "Our most popular plan. Balanced returns with medium flexibility.",
    featured: true,
    suggestions: [20000, 50000, 100000, 200000],
    tip: "Most popular choice. Locked for 90 days.",
  },
  {
    id: "max",
    name: "Max Yield",
    apy: "8",
    label: "Highest return",
    labelColor: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    minDeposit: 50000,
    lockPeriod: "180 days",
    description: "For committed savers. Maximum returns with a longer commitment period.",
    featured: false,
    suggestions: [50000, 100000, 250000, 500000],
    tip: "Best returns. Locked for 6 months.",
  },
];

export default function Invest() {
  const { toast } = useToast();
  const { selected } = useCurrency();
  const { user } = usePrivy();

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const numericAmount = parseFloat(amount) || 0;

  const handleInvest = (plan: any) => {
    setSelectedPlan(plan);
    setAmount("");
    setSuccess(false);
  };

  const handleConfirm = async () => {
    if (!amount || !selectedPlan) return;
    if (numericAmount < selectedPlan.minDeposit) {
      toast({
        title: "Amount too low",
        description: `Minimum deposit is ${selected.symbol}${new Intl.NumberFormat("en-NG").format(selectedPlan.minDeposit)}`,
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
  };

  if (success && selectedPlan) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background">
        <div className="w-full max-w-[430px] flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Investment Started!</h2>
            <p className="text-muted-foreground mt-2">
              {selected.symbol}{new Intl.NumberFormat("en-NG").format(numericAmount)} in {selectedPlan.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Earning {selectedPlan.apy}% APY · {selectedPlan.lockPeriod}
            </p>
          </div>
          <Button asChild className="w-full h-14 rounded-2xl text-base font-semibold">
            <Link to="/dashboard">Done</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">

        <header className="px-4 py-4 flex items-center sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <Button asChild variant="ghost" size="icon" className="w-10 h-10 rounded-full">
            <Link to="/dashboard"><ChevronLeft className="w-6 h-6" /></Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground absolute left-1/2 -translate-x-1/2">Invest</h1>
        </header>

        <main className="px-6 flex-1 flex flex-col gap-6 pb-12 pt-2">

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Grow your money</h2>
            <p className="text-sm text-muted-foreground">Choose a plan that works for you. Returns paid monthly to your balance.</p>
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-semibold w-fit mt-2">
              <TrendingUp className="w-4 h-4" />
              {selected.symbol}48.2M+ invested by Susu users
            </div>
          </section>

          <div className="space-y-4">
            {PLANS.map((plan, index) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Card className={`p-6 rounded-[1.5rem] relative overflow-hidden ${plan.featured ? "bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 scale-[1.02]" : "bg-card border-border/50 shadow-sm"}`}>
                  {plan.featured && (
                    <>
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute right-0 top-0 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
                    </>
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className={`text-xl font-bold ${plan.featured ? "text-primary-foreground" : "text-foreground"}`}>{plan.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${plan.labelColor}`}>{plan.label}</span>
                    </div>
                    <div className="mb-6 flex items-baseline">
                      <span className="text-5xl font-extrabold tracking-tight mr-1">{plan.apy}</span>
                      <span className={`text-xl font-bold ${plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>% APY</span>
                    </div>
                    <div className={`flex items-center gap-4 text-sm mb-4 font-medium ${plan.featured ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                      <div className="flex flex-col">
                        <span className={`text-[10px] uppercase tracking-wider ${plan.featured ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>Min Deposit</span>
                        <span>{selected.symbol}{new Intl.NumberFormat("en-NG").format(plan.minDeposit)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[10px] uppercase tracking-wider ${plan.featured ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>Lock Period</span>
                        <span>{plan.lockPeriod}</span>
                      </div>
                    </div>
                    <p className={`text-sm mb-6 ${plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{plan.description}</p>
                    <Button
                      className={`w-full rounded-xl h-12 font-bold ${plan.featured ? "bg-white text-primary hover:bg-white/90" : "bg-transparent border-2 border-primary text-primary hover:bg-primary/5"}`}
                      variant={plan.featured ? "default" : "outline"}
                      onClick={() => handleInvest(plan)}
                    >
                      Start Investing
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

        </main>

        {/* Investment Sheet */}
        <AnimatePresence>
          {selectedPlan && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSelectedPlan(null)} />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-background rounded-t-[2rem] shadow-2xl z-50 border-t border-border">
                <div className="px-6 pt-5 pb-8">
                  <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => setSelectedPlan(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-5">{selectedPlan.tip}</p>

                  {/* Suggested amounts */}
                  <p className="text-sm font-semibold text-foreground mb-2">Suggested amounts</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {selectedPlan.suggestions.map((s: number) => (
                      <button key={s} onClick={() => setAmount(String(s))}
                        className={`py-3 rounded-2xl text-sm font-semibold transition-colors ${amount === String(s) ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground hover:bg-primary/10 hover:text-primary"}`}>
                        {selected.symbol}{new Intl.NumberFormat("en-NG").format(s)}
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <p className="text-sm font-semibold text-foreground mb-2">Or enter custom amount</p>
                  <div className="relative mb-2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">{selected.symbol}</span>
                    <input type="number" placeholder="0"
                      className="w-full pl-10 pr-4 py-4 rounded-2xl border border-border bg-muted/30 text-foreground text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-5">
                    Min: {selected.symbol}{new Intl.NumberFormat("en-NG").format(selectedPlan.minDeposit)} · {selectedPlan.apy}% APY · {selectedPlan.lockPeriod}
                  </p>

                  <Button className="w-full h-14 rounded-2xl font-bold text-base" onClick={handleConfirm} disabled={!amount || loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Invest ${amount ? `${selected.symbol}${new Intl.NumberFormat("en-NG").format(numericAmount)}` : ""}`}
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
