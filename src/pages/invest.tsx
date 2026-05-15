import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const PLANS = [
  {
    id: "flex",
    name: "Flex Saver",
    apy: "4",
    label: "Low risk",
    labelColor: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    minDeposit: "₦5,000",
    lockPeriod: "No lock-in",
    description: "Withdraw anytime. Ideal for emergency funds and short-term goals.",
    featured: false,
  },
  {
    id: "growth",
    name: "Growth Plan",
    apy: "6",
    label: "Recommended",
    labelColor: "text-primary bg-primary-foreground/20",
    minDeposit: "₦20,000",
    lockPeriod: "90 days",
    description: "Our most popular plan. Balanced returns with medium flexibility.",
    featured: true,
  },
  {
    id: "max",
    name: "Max Yield",
    apy: "8",
    label: "Highest return",
    labelColor: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    minDeposit: "₦50,000",
    lockPeriod: "180 days",
    description: "For committed savers. Maximum returns with a longer commitment period.",
    featured: false,
  },
];

export default function Invest() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const handleInvest = (planId: string) => {
    setSelectedPlan(planId);
    setAmount("");
  };

  const handleConfirm = () => {
    if (!amount) return;
    toast({
      title: "Investment started!",
      description: `You have successfully invested in the selected plan.`,
    });
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">
        
        {/* Header */}
        <header className="px-4 py-4 flex items-center sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground absolute left-1/2 -translate-x-1/2">Invest</h1>
        </header>

        <main className="px-6 flex-1 flex flex-col gap-6 pb-12 pt-2">
          
          {/* Intro Section */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Grow your money</h2>
            <p className="text-sm text-muted-foreground">Choose a plan that works for you. Your returns are paid monthly, directly to your balance.</p>
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-semibold w-fit mt-2">
              <TrendingUp className="w-4 h-4" />
              ₦ 48.2M+ invested by Susu users
            </div>
          </section>

          {/* Plans */}
          <div className="space-y-4">
            {PLANS.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className={`p-6 rounded-[1.5rem] relative overflow-hidden ${
                    plan.featured 
                      ? 'bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 scale-[1.02]' 
                      : 'bg-card border-border/50 shadow-sm'
                  }`}
                  data-testid={`card-plan-${plan.id}`}
                >
                  {plan.featured && (
                    <>
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute right-0 top-0 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Most Popular
                      </div>
                    </>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className={`text-xl font-bold ${plan.featured ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {plan.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${plan.labelColor}`}>
                        {plan.label}
                      </span>
                    </div>
                    
                    <div className="mb-6 flex items-baseline">
                      <span className="text-5xl font-extrabold tracking-tight mr-1">{plan.apy}</span>
                      <span className={`text-xl font-bold ${plan.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>% APY</span>
                    </div>
                    
                    <div className={`flex items-center gap-4 text-sm mb-4 font-medium ${plan.featured ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                      <div className="flex flex-col">
                        <span className={`text-[10px] uppercase tracking-wider ${plan.featured ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>Min Deposit</span>
                        <span>{plan.minDeposit}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[10px] uppercase tracking-wider ${plan.featured ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>Lock Period</span>
                        <span>{plan.lockPeriod}</span>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-6 ${plan.featured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {plan.description}
                    </p>
                    
                    <Button 
                      className={`w-full rounded-xl h-12 font-bold ${
                        plan.featured 
                          ? 'bg-white text-primary hover:bg-white/90' 
                          : 'bg-transparent border-2 border-primary text-primary hover:bg-primary/5'
                      }`}
                      variant={plan.featured ? "default" : "outline"}
                      onClick={() => handleInvest(plan.id)}
                      data-testid={`button-invest-${plan.id}`}
                    >
                      Start Investing
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

        </main>

        {/* Investment Bottom Sheet */}
        <AnimatePresence>
          {selectedPlan && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                onClick={() => setSelectedPlan(null)}
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-card rounded-t-3xl shadow-2xl z-50 p-6 border-t border-border"
                data-testid="modal-invest"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Investment Amount</h3>
                  <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => setSelectedPlan(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="mb-8 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₦</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-16 text-3xl font-bold pl-12 rounded-2xl border-2 focus-visible:ring-0 focus-visible:border-primary focus-visible:ring-offset-0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-between mt-2 px-1">
                    <p className="text-xs text-muted-foreground">Balance: ₦1,240,500.00</p>
                    <button className="text-xs font-bold text-primary hover:underline">Use Max</button>
                  </div>
                </div>

                <Button 
                  className="w-full h-14 rounded-xl font-bold text-lg" 
                  onClick={handleConfirm}
                  disabled={!amount}
                  data-testid="button-confirm-invest"
                >
                  Confirm Investment
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
