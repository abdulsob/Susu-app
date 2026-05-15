import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, 
  Wallet, 
  History, 
  CircleDollarSign, 
  User,
  ChevronRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ACTIVE_CIRCLES = [
  {
    id: 1,
    name: "Lagos Friends Circle",
    members: 8,
    contribution: "₦25,000",
    frequency: "month",
    nextPayout: "Dec 1, 2025",
    progress: 6,
    totalCycles: 8,
    position: 7
  },
  {
    id: 2,
    name: "Tech Professionals Pool",
    members: 12,
    contribution: "₦50,000",
    frequency: "month",
    nextPayout: "Oct 15, 2025",
    progress: 3,
    totalCycles: 12,
    position: 4
  }
];

const DISCOVER_CIRCLES = [
  {
    id: 3,
    name: "Family Heritage Fund",
    category: "Family",
    spotsFilled: 5,
    totalSpots: 10,
    contribution: "₦10,000",
    frequency: "month"
  },
  {
    id: 4,
    name: "Market Traders Union",
    category: "Business",
    spotsFilled: 18,
    totalSpots: 20,
    contribution: "₦100,000",
    frequency: "week"
  }
];

export default function Circles() {
  const { toast } = useToast();

  const handleCreateCircle = () => {
    toast({
      title: "Coming Soon",
      description: "Circle creation coming soon!",
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background pb-20">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-start justify-between sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">Savings Circles</h1>
            <p className="text-sm text-muted-foreground mt-1">Grow together, one cycle at a time</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full border-primary text-primary hover:bg-primary/5 h-9 px-3"
            onClick={handleCreateCircle}
            data-testid="button-create-circle"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </header>

        <main className="px-6 flex-1 flex flex-col gap-8 pb-8 pt-2">
          
          {/* Active Circles */}
          <section>
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-lg font-bold mb-4"
            >
              Your Active Circles
            </motion.h2>
            <div className="space-y-4">
              {ACTIVE_CIRCLES.map((circle, index) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-5 bg-card border-border/50 shadow-md shadow-black/5 rounded-[1.5rem] relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{circle.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Users className="w-4 h-4" />
                          <span>{circle.members} Members</span>
                        </div>
                      </div>
                      <div className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md">
                        {circle.contribution} / {circle.frequency}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Cycle Progress</span>
                        <span className="text-foreground">{circle.progress} of {circle.totalCycles}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${(circle.progress / circle.totalCycles) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Next payout: {circle.nextPayout}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">
                          You receive: <span className="bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded text-xs ml-1">Cycle {circle.position}</span>
                        </p>
                      </div>
                      <Link href={`/circles/${circle.id}`} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline" data-testid={`link-view-details-${circle.id}`}>
                        Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Discover Circles */}
          <section>
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg font-bold mb-4"
            >
              Discover Circles
            </motion.h2>
            <div className="space-y-4">
              {DISCOVER_CIRCLES.map((circle, index) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                >
                  <Card className="p-4 bg-card border-border/50 shadow-sm rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-sm">{circle.name}</h3>
                        <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                          {circle.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{circle.spotsFilled}/{circle.totalSpots} spots filled</p>
                      <p className="text-sm font-medium text-foreground">{circle.contribution} / {circle.frequency}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl shrink-0" data-testid={`button-join-circle-${circle.id}`}>
                      Join
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

        </main>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 w-full max-w-[430px] bg-background border-t border-border px-6 py-4 flex items-center justify-between z-30 pb-safe">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-home">
            <Wallet className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/history" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-history">
            <History className="w-6 h-6" />
            <span className="text-[10px] font-medium">History</span>
          </Link>
          <button className="flex flex-col items-center gap-1 text-primary" data-testid="nav-circles">
            <CircleDollarSign className="w-6 h-6" fill="currentColor" fillOpacity={0.2} />
            <span className="text-[10px] font-bold">Circles</span>
          </button>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-profile">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
        
      </div>
    </div>
  );
}
