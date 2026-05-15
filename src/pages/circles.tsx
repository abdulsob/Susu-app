import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, Wallet, History, CircleDollarSign, User,
  ChevronRight, Plus, X, Loader2, CheckCircle2, Briefcase,
  Heart, Home, GraduationCap, ShoppingBag, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/currency";

const CIRCLE_TEMPLATES = [
  { id: "friends",   emoji: "👫", label: "Friends Circle",    members: 5,  contribution: 10000, frequency: "month", description: "Save together with close friends" },
  { id: "family",    emoji: "🏠", label: "Family Fund",       members: 8,  contribution: 20000, frequency: "month", description: "Monthly family savings pool" },
  { id: "business",  emoji: "💼", label: "Business Partners", members: 6,  contribution: 50000, frequency: "month", description: "Grow your business capital together" },
  { id: "community", emoji: "🌍", label: "Community Esusu",   members: 10, contribution: 5000,  frequency: "week",  description: "Traditional rotating savings" },
  { id: "school",    emoji: "🎓", label: "School Fees Pool",  members: 4,  contribution: 30000, frequency: "month", description: "Save for children's education" },
  { id: "market",    emoji: "🛒", label: "Market Traders",    members: 12, contribution: 25000, frequency: "month", description: "For market traders and small business" },
];

export default function Circles() {
  const { toast } = useToast();
  const { selected } = useCurrency();

  const [myCircles, setMyCircles] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [circleName, setCircleName] = useState("");
  const [circleMembers, setCircleMembers] = useState("");
  const [circleContribution, setCircleContribution] = useState("");
  const [circleFrequency, setCircleFrequency] = useState("month");
  const [creating, setCreating] = useState(false);
  const [joinCircleId, setJoinCircleId] = useState<number | null>(null);

  function handleTemplateSelect(template: any) {
    setSelectedTemplate(template);
    setCircleName(template.label);
    setCircleMembers(String(template.members));
    setCircleContribution(String(template.contribution));
    setCircleFrequency(template.frequency);
    setShowTemplates(false);
  }

  async function handleCreateCircle() {
    if (!circleName || !circleMembers || !circleContribution) return;
    setCreating(true);
    await new Promise(r => setTimeout(r, 800));
    const newCircle = {
      id: Date.now(),
      name: circleName,
      members: parseInt(circleMembers),
      contribution: parseInt(circleContribution),
      frequency: circleFrequency,
      progress: 0,
      totalCycles: parseInt(circleMembers),
      position: 1,
      nextPayout: "TBD",
      emoji: selectedTemplate?.emoji ?? "⭕",
    };
    setMyCircles(prev => [...prev, newCircle]);
    setSelectedTemplate(null);
    setCircleName("");
    setCircleMembers("");
    setCircleContribution("");
    setCreating(false);
    toast({ title: "Circle created!", description: `${newCircle.name} is ready. Share the invite link with members.` });
  }

  const DISCOVER_CIRCLES = [
    { id: 1, name: "Lagos Friends Circle",    category: "Friends",  spotsFilled: 3,  totalSpots: 8,  contribution: 25000, frequency: "month" },
    { id: 2, name: "Tech Professionals Pool", category: "Business", spotsFilled: 9,  totalSpots: 12, contribution: 50000, frequency: "month" },
    { id: 3, name: "Family Heritage Fund",    category: "Family",   spotsFilled: 5,  totalSpots: 10, contribution: 10000, frequency: "month" },
    { id: 4, name: "Market Traders Union",    category: "Business", spotsFilled: 18, totalSpots: 20, contribution: 100000, frequency: "week" },
  ];

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background pb-20">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">

        <header className="px-6 py-6 flex items-start justify-between sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">Savings Circles</h1>
            <p className="text-sm text-muted-foreground mt-1">Grow together, one cycle at a time</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full border-primary text-primary hover:bg-primary/5 h-9 px-3"
            onClick={() => setShowTemplates(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create
          </Button>
        </header>

        <main className="px-6 flex-1 flex flex-col gap-8 pb-8 pt-2">

          {/* My Circles */}
          <section>
            <h2 className="text-lg font-bold mb-4">Your Active Circles</h2>
            {myCircles.length === 0 ? (
              <div className="flex flex-col items-center text-center py-8 gap-3">
                <div className="text-4xl">⭕</div>
                <p className="text-sm font-semibold text-foreground">No circles yet</p>
                <p className="text-xs text-muted-foreground">Create or join a circle to start saving together</p>
                <Button onClick={() => setShowTemplates(true)} size="sm" className="rounded-2xl">
                  <Plus className="w-4 h-4 mr-1" /> Create a Circle
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myCircles.map((circle, index) => (
                  <motion.div key={circle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card className="p-5 bg-card border-border/50 shadow-md rounded-[1.5rem]">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{circle.emoji}</span>
                          <div>
                            <h3 className="font-bold text-foreground">{circle.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Users className="w-3 h-3" />
                              <span>{circle.members} Members</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md">
                          {selected.symbol}{new Intl.NumberFormat("en-NG").format(circle.contribution)}/{circle.frequency}
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Cycle Progress</span>
                          <span>{circle.progress} of {circle.totalCycles}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${(circle.progress / circle.totalCycles) * 100}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">You receive: Cycle {circle.position}</p>
                        <button className="text-primary text-sm font-medium flex items-center gap-1">
                          Details <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Discover */}
          <section>
            <h2 className="text-lg font-bold mb-4">Discover Circles</h2>
            <div className="space-y-3">
              {DISCOVER_CIRCLES.map((circle, index) => (
                <motion.div key={circle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }}>
                  <Card className="p-4 bg-card border-border/50 shadow-sm rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-sm">{circle.name}</h3>
                        <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">{circle.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{circle.spotsFilled}/{circle.totalSpots} spots filled</p>
                      <p className="text-sm font-medium text-foreground">{selected.symbol}{new Intl.NumberFormat("en-NG").format(circle.contribution)} / {circle.frequency}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl shrink-0"
                      onClick={() => {
                        toast({ title: "Request sent!", description: `Your request to join ${circle.name} has been sent.` });
                      }}>
                      Join
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

        </main>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 w-full max-w-[430px] bg-background border-t border-border px-6 py-4 flex items-center justify-between z-30">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Wallet className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <History className="w-6 h-6" />
            <span className="text-[10px] font-medium">History</span>
          </Link>
          <button className="flex flex-col items-center gap-1 text-primary">
            <CircleDollarSign className="w-6 h-6" fill="currentColor" fillOpacity={0.2} />
            <span className="text-[10px] font-bold">Circles</span>
          </button>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>

      </div>

      {/* Templates Sheet */}
      <AnimatePresence>
        {showTemplates && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowTemplates(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-background rounded-t-[2rem] z-50 shadow-2xl border-t border-border">
              <div className="px-6 pt-5 pb-2 flex items-center justify-between">
                <div>
                  <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground">Choose a circle type</h3>
                  <p className="text-sm text-muted-foreground mt-1">Pick a template or start from scratch</p>
                </div>
                <button onClick={() => setShowTemplates(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="px-6 pb-6 pt-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {CIRCLE_TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => handleTemplateSelect(t)}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-primary/10 transition-colors text-left">
                      <span className="text-2xl mt-0.5">{t.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.members} members</p>
                        <p className="text-xs text-primary font-medium mt-0.5">{selected.symbol}{new Intl.NumberFormat("en-NG").format(t.contribution)}/{t.frequency}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => handleTemplateSelect({ emoji: "⭕", label: "", members: 5, contribution: 10000, frequency: "month" })}
                  className="w-full p-3 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
                  + Custom circle
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Customize Circle Sheet */}
      <AnimatePresence>
        {selectedTemplate !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setSelectedTemplate(null)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-background rounded-t-[2rem] z-50 shadow-2xl border-t border-border">
              <div className="px-6 pt-5 pb-8">
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-4">Customize your circle</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Circle name</label>
                    <input value={circleName} onChange={(e) => setCircleName(e.target.value)} placeholder="e.g. Lagos Friends Circle"
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Number of members</label>
                    <input type="number" value={circleMembers} onChange={(e) => setCircleMembers(e.target.value)} placeholder="e.g. 8"
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Contribution per cycle ({selected.symbol})</label>
                    <input type="number" value={circleContribution} onChange={(e) => setCircleContribution(e.target.value)} placeholder="e.g. 25000"
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Frequency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["week", "month", "quarter"].map((f) => (
                        <button key={f} onClick={() => setCircleFrequency(f)}
                          className={`py-3 rounded-2xl text-sm font-semibold capitalize transition-colors ${circleFrequency === f ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground hover:bg-primary/10"}`}>
                          {f}ly
                        </button>
                      ))}
                    </div>
                  </div>
                  {circleContribution && circleMembers && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
                      <p className="text-xs text-muted-foreground">Each member receives</p>
                      <p className="text-lg font-bold text-primary">
                        {selected.symbol}{new Intl.NumberFormat("en-NG").format(parseInt(circleContribution) * parseInt(circleMembers))}
                      </p>
                      <p className="text-xs text-muted-foreground">when it's their turn</p>
                    </div>
                  )}
                  <Button className="w-full h-14 rounded-2xl text-base font-semibold"
                    disabled={!circleName || !circleMembers || !circleContribution || creating}
                    onClick={handleCreateCircle}>
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Circle"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
