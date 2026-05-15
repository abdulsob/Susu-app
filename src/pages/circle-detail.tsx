import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Info, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

type CircleData = {
  id: string;
  name: string;
  description: string;
  members: number;
  contribution: string;
  contributionRaw: number;
  frequency: string;
  nextPayout: string;
  nextContributionDue: string;
  progress: number;
  totalCycles: number;
  yourPosition: number;
  totalPool: string;
  status: string;
  memberList: Array<{
    id: number;
    name: string;
    initials: string;
    position: number;
    paid: boolean;
    isYou: boolean;
  }>;
  payoutSchedule: Array<{
    cycle: number;
    recipient: string;
    date: string;
    amount: string;
    status: "paid" | "upcoming" | "pending";
  }>;
};

const CIRCLE_DATA: Record<string, CircleData> = {
  "1": {
    id: "1",
    name: "Lagos Friends Circle",
    description: "A tight-knit savings group from Lagos Island. We've been saving together since 2022.",
    members: 8,
    contribution: "₦25,000",
    contributionRaw: 25000,
    frequency: "month",
    nextPayout: "Dec 1, 2025",
    nextContributionDue: "Nov 15, 2025",
    progress: 6,
    totalCycles: 8,
    yourPosition: 7,
    totalPool: "₦200,000",
    status: "active",
    memberList: [
      { id: 1, name: "Adaeze Okafor", initials: "AO", position: 1, paid: true, isYou: false },
      { id: 2, name: "Emeka Eze", initials: "EE", position: 2, paid: true, isYou: false },
      { id: 3, name: "Fatima Bello", initials: "FB", position: 3, paid: true, isYou: false },
      { id: 4, name: "Chidi Nwosu", initials: "CN", position: 4, paid: true, isYou: false },
      { id: 5, name: "Ngozi Adeyemi", initials: "NA", position: 5, paid: true, isYou: false },
      { id: 6, name: "Biodun Taiwo", initials: "BT", position: 6, paid: true, isYou: false },
      { id: 7, name: "You", initials: "JD", position: 7, paid: false, isYou: true },
      { id: 8, name: "Amina Yusuf", initials: "AY", position: 8, paid: false, isYou: false },
    ],
    payoutSchedule: [
      { cycle: 1, recipient: "Adaeze Okafor", date: "Jun 1, 2025", amount: "₦200,000", status: "paid" },
      { cycle: 2, recipient: "Emeka Eze", date: "Jul 1, 2025", amount: "₦200,000", status: "paid" },
      { cycle: 3, recipient: "Fatima Bello", date: "Aug 1, 2025", amount: "₦200,000", status: "paid" },
      { cycle: 4, recipient: "Chidi Nwosu", date: "Sep 1, 2025", amount: "₦200,000", status: "paid" },
      { cycle: 5, recipient: "Ngozi Adeyemi", date: "Oct 1, 2025", amount: "₦200,000", status: "paid" },
      { cycle: 6, recipient: "Biodun Taiwo", date: "Nov 1, 2025", amount: "₦200,000", status: "paid" },
      { cycle: 7, recipient: "You", date: "Dec 1, 2025", amount: "₦200,000", status: "upcoming" },
      { cycle: 8, recipient: "Amina Yusuf", date: "Jan 1, 2026", amount: "₦200,000", status: "pending" },
    ]
  },
  "2": {
    id: "2",
    name: "Tech Professionals Pool",
    description: "A savings circle for tech professionals across Lagos, Abuja, and Port Harcourt.",
    members: 12,
    contribution: "₦50,000",
    contributionRaw: 50000,
    frequency: "month",
    nextPayout: "Oct 15, 2025",
    nextContributionDue: "Oct 1, 2025",
    progress: 3,
    totalCycles: 12,
    yourPosition: 4,
    totalPool: "₦600,000",
    status: "active",
    memberList: [
      { id: 1, name: "Kelechi Onu", initials: "KO", position: 1, paid: true, isYou: false },
      { id: 2, name: "Seun Adebayo", initials: "SA", position: 2, paid: true, isYou: false },
      { id: 3, name: "Temi Oladele", initials: "TO", position: 3, paid: true, isYou: false },
      { id: 4, name: "You", initials: "JD", position: 4, paid: false, isYou: true },
      { id: 5, name: "Dami Akinwande", initials: "DA", position: 5, paid: false, isYou: false },
      { id: 6, name: "Ifeanyi Obi", initials: "IO", position: 6, paid: false, isYou: false },
      { id: 7, name: "Zainab Musa", initials: "ZM", position: 7, paid: false, isYou: false },
      { id: 8, name: "Nnamdi Okonkwo", initials: "NK", position: 8, paid: false, isYou: false },
      { id: 9, name: "Blessing Eze", initials: "BE", position: 9, paid: false, isYou: false },
      { id: 10, name: "Rotimi Afolabi", initials: "RA", position: 10, paid: false, isYou: false },
      { id: 11, name: "Chiamaka Obi", initials: "CO", position: 11, paid: false, isYou: false },
      { id: 12, name: "Uche Okafor", initials: "UO", position: 12, paid: false, isYou: false },
    ],
    payoutSchedule: [
      { cycle: 1, recipient: "Kelechi Onu", date: "Jul 15, 2025", amount: "₦600,000", status: "paid" },
      { cycle: 2, recipient: "Seun Adebayo", date: "Aug 15, 2025", amount: "₦600,000", status: "paid" },
      { cycle: 3, recipient: "Temi Oladele", date: "Sep 15, 2025", amount: "₦600,000", status: "paid" },
      { cycle: 4, recipient: "You", date: "Oct 15, 2025", amount: "₦600,000", status: "upcoming" },
      { cycle: 5, recipient: "Dami Akinwande", date: "Nov 15, 2025", amount: "₦600,000", status: "pending" },
      { cycle: 6, recipient: "Ifeanyi Obi", date: "Dec 15, 2025", amount: "₦600,000", status: "pending" },
      { cycle: 7, recipient: "Zainab Musa", date: "Jan 15, 2026", amount: "₦600,000", status: "pending" },
      { cycle: 8, recipient: "Nnamdi Okonkwo", date: "Feb 15, 2026", amount: "₦600,000", status: "pending" },
      { cycle: 9, recipient: "Blessing Eze", date: "Mar 15, 2026", amount: "₦600,000", status: "pending" },
      { cycle: 10, recipient: "Rotimi Afolabi", date: "Apr 15, 2026", amount: "₦600,000", status: "pending" },
      { cycle: 11, recipient: "Chiamaka Obi", date: "May 15, 2026", amount: "₦600,000", status: "pending" },
      { cycle: 12, recipient: "Uche Okafor", date: "Jun 15, 2026", amount: "₦600,000", status: "pending" },
    ]
  }
};

export default function CircleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const circle = id ? CIRCLE_DATA[id] : undefined;
  
  const youMember = circle?.memberList.find(m => m.isYou);
  const initiallyPaid = youMember?.paid ?? false;
  const [hasPaid, setHasPaid] = useState(initiallyPaid);
  const [showModal, setShowModal] = useState(false);

  if (!circle) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background">
        <div className="w-full max-w-[430px] flex-1 flex flex-col justify-center px-6 text-center">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Circle not found</h2>
          <p className="text-muted-foreground mb-6">The circle you are looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/circles")} data-testid="button-back">
            Go back to Circles
          </Button>
        </div>
      </div>
    );
  }

  const handleConfirmPayment = () => {
    setHasPaid(true);
    setShowModal(false);
    toast({
      title: "Success",
      description: `Contribution of ${circle.contribution} submitted successfully!`,
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background pb-24">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <button 
            onClick={() => navigate("/circles")} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors shrink-0"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{circle.name}</h1>
          </div>
        </header>

        <main className="px-6 flex-1 flex flex-col gap-8 pb-8 pt-2">
          
          {/* Hero info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="p-6 bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 rounded-[1.5rem] relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-accent/20 rounded-full blur-xl" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-primary-foreground/80 font-medium text-sm">Total Pool</p>
                  <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
                    <span>{circle.contribution} / {circle.frequency}</span>
                  </div>
                </div>
                
                <h3 className="text-4xl font-extrabold tracking-tight mb-8">
                  {circle.totalPool}
                </h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-medium text-primary-foreground/90">
                    <span>Cycle {circle.progress} of {circle.totalCycles}</span>
                    <span>Next payout: {circle.nextPayout}</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${(circle.progress / circle.totalCycles) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-5 border-t border-primary-foreground/10">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <p className="text-sm font-medium text-primary-foreground">
                    Your payout: <span className="bg-accent/20 text-accent font-bold px-1.5 py-0.5 rounded text-xs ml-1">Cycle {circle.yourPosition}</span>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Contribution Due Banner */}
          {!hasPaid ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-accent/10 border border-accent/20 rounded-2xl p-5"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="bg-accent/20 text-accent-foreground p-2 rounded-full mt-0.5">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Contribution Due</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Your contribution of {circle.contribution} is due by {circle.nextContributionDue}.
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full mt-2 font-bold" 
                  onClick={() => setShowModal(true)}
                  data-testid="button-make-contribution"
                >
                  Make Contribution
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="bg-primary/20 text-primary p-1.5 rounded-full shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Contribution paid for this cycle
              </p>
            </motion.div>
          )}

          {/* Members section */}
          <section>
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg font-bold mb-4"
            >
              Members ({circle.members})
            </motion.h2>
            <div className="space-y-3">
              {circle.memberList.map((member, index) => {
                const isPaid = member.isYou ? hasPaid : member.paid;
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-card-border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-10 w-10 ${member.isYou ? 'bg-primary text-primary-foreground font-bold' : 'bg-primary/10 text-primary'}`}>
                        <AvatarFallback className="bg-transparent">{member.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`font-semibold text-sm ${member.isYou ? 'text-primary' : 'text-foreground'}`}>
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Cycle {member.position}</p>
                      </div>
                    </div>
                    <div>
                      {isPaid ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (member.isYou ? (
                        <span className="text-xs font-medium text-accent-foreground bg-accent/20 px-2 py-1 rounded-md">
                          Due
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                          Pending
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Payout Schedule section */}
          <section className="mt-4">
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg font-bold mb-4"
            >
              Payout Schedule
            </motion.h2>
            <div className="relative pl-3 space-y-0">
              {/* Timeline line */}
              <div className="absolute left-6 top-4 bottom-4 w-px bg-border z-0" />
              
              {circle.payoutSchedule.map((payout, index) => {
                const isPaid = payout.status === "paid";
                const isUpcoming = payout.status === "upcoming";
                
                return (
                  <motion.div
                    key={payout.cycle}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                    className={`relative z-10 flex items-center gap-4 py-4 px-3 rounded-xl transition-colors ${
                      isUpcoming ? 'bg-primary/5 border border-primary/10' : ''
                    } ${isPaid ? 'opacity-60' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 z-10 ${
                      isPaid ? 'bg-primary text-primary-foreground' :
                      isUpcoming ? 'bg-accent text-accent-foreground shadow-sm shadow-accent/20 ring-4 ring-accent/10' :
                      'bg-background border-2 border-muted-foreground/30 text-muted-foreground'
                    }`}>
                      {payout.cycle}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm truncate ${payout.recipient === "You" ? 'text-primary' : 'text-foreground'}`}>
                          {payout.recipient}
                        </p>
                        {isUpcoming && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                            Next
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{payout.date}</p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${isUpcoming ? 'text-foreground' : isPaid ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {payout.amount}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

        </main>
      </div>

      {/* Bottom Sheet Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-background rounded-t-[2rem] p-6 z-50 shadow-2xl border-t border-border"
              data-testid="modal-contribution"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Confirm Contribution</h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Circle</span>
                  <span className="font-semibold text-foreground">{circle.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-primary text-base">{circle.contribution}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-3 border-t border-border">
                  <span className="text-muted-foreground">Due By</span>
                  <span className="font-medium text-foreground">{circle.nextContributionDue}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowModal(false)}
                  data-testid="button-cancel-payment"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  onClick={handleConfirmPayment}
                  data-testid="button-confirm-payment"
                >
                  Confirm Payment
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
