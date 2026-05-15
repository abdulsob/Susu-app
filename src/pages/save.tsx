import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Laptop, Shield, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const GOALS = [
  {
    id: 1,
    name: "New Laptop",
    icon: Laptop,
    target: 250000,
    saved: 185000,
    deadline: "Mar 2026",
    color: "primary",
    autoSave: "₦15,000 / month",
  },
  {
    id: 2,
    name: "Emergency Fund",
    icon: Shield,
    target: 500000,
    saved: 120000,
    deadline: "Dec 2025",
    color: "amber",
    autoSave: "₦20,000 / month",
  },
  {
    id: 3,
    name: "Family Trip",
    icon: Plane,
    target: 150000,
    saved: 45000,
    deadline: "Jun 2026",
    color: "primary",
    autoSave: "₦10,000 / month",
  },
];

export default function Save() {
  const { toast } = useToast();

  const handleAddFunds = () => {
    toast({
      title: "Redirecting",
      description: "Redirecting to deposit...",
    });
  };

  const handleNewGoal = () => {
    toast({
      title: "Coming soon",
      description: "Goal creation coming soon!",
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">
        
        {/* Header */}
        <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <Button asChild variant="ghost" size="icon" className="w-10 h-10 rounded-full">
            <Link to="/dashboard">
              <ChevronLeft className="w-6 h-6" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground absolute left-1/2 -translate-x-1/2">My Savings</h1>
          <Button variant="outline" size="icon" className="w-10 h-10 rounded-full border-primary/20 text-primary hover:bg-primary/5" onClick={handleNewGoal}>
            <Plus className="w-5 h-5" />
          </Button>
        </header>

        <main className="px-6 flex-1 flex flex-col gap-6 pb-12 pt-2">
          
          {/* Summary Strip */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-primary/5 rounded-2xl p-4 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-muted-foreground">Total Saved</span>
              <span className="text-primary text-lg">₦ 350,000</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Active Goals: 3</span>
              <span className="flex items-center gap-1">Next milestone: <strong className="text-foreground">₦15,000 away</strong></span>
            </div>
          </motion.div>

          {/* Goals List */}
          <div className="space-y-4">
            {GOALS.map((goal, index) => {
              const Icon = goal.icon;
              const percentage = Math.round((goal.saved / goal.target) * 100);
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-5 rounded-[1.5rem] bg-card border-border/50 shadow-sm" data-testid={`card-goal-${goal.id}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${goal.color}/10 text-${goal.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-foreground text-lg">{goal.name}</h3>
                      </div>
                      <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                        {goal.deadline}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">
                        <span className="font-bold text-primary text-base">₦ {goal.saved.toLocaleString()}</span>
                        <span className="text-muted-foreground"> / ₦ {goal.target.toLocaleString()}</span>
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-secondary rounded-full h-2.5 overflow-hidden" data-testid={`progress-bar-${goal.id}`}>
                          <div 
                            className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-8 text-right">{percentage}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Auto-saving {goal.autoSave}
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl border-border h-8 text-xs font-semibold" onClick={handleAddFunds} data-testid={`button-add-funds-${goal.id}`}>
                        Add Funds
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* New Goal Empty Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card 
              className="p-6 rounded-[1.5rem] bg-transparent border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={handleNewGoal}
              data-testid="button-new-goal"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                <Plus className="w-6 h-6" />
              </div>
              <p className="font-medium text-muted-foreground text-sm">Create a new savings goal</p>
            </Card>
          </motion.div>

        </main>
      </div>
    </div>
  );
}
