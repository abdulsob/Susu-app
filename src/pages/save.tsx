import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronLeft, Plus, X, Laptop, Shield, Plane, GraduationCap,
  Home, Car, Heart, ShoppingBag, Check, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/currency";

const GOAL_TEMPLATES = [
  { id: "laptop",    icon: <Laptop className="w-6 h-6" />,      label: "New Laptop",      emoji: "💻", suggested: 250000, months: 6 },
  { id: "emergency", icon: <Shield className="w-6 h-6" />,      label: "Emergency Fund",  emoji: "🛡️", suggested: 500000, months: 12 },
  { id: "travel",    icon: <Plane className="w-6 h-6" />,       label: "Family Trip",     emoji: "✈️", suggested: 150000, months: 6 },
  { id: "school",    icon: <GraduationCap className="w-6 h-6" />, label: "School Fees",  emoji: "🎓", suggested: 300000, months: 3 },
  { id: "house",     icon: <Home className="w-6 h-6" />,        label: "House Rent",      emoji: "🏠", suggested: 600000, months: 12 },
  { id: "car",       icon: <Car className="w-6 h-6" />,         label: "Buy a Car",       emoji: "🚗", suggested: 2000000, months: 24 },
  { id: "health",    icon: <Heart className="w-6 h-6" />,       label: "Health Fund",     emoji: "❤️", suggested: 200000, months: 6 },
  { id: "shopping",  icon: <ShoppingBag className="w-6 h-6" />, label: "Shopping Goal",   emoji: "🛍️", suggested: 100000, months: 3 },
];

export default function Save() {
  const { toast } = useToast();
  const { selected } = useCurrency();

  const [goals, setGoals] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalMonths, setGoalMonths] = useState("");
  const [saving, setSaving] = useState(false);

  const totalSaved = goals.reduce((sum, g) => sum + (g.saved ?? 0), 0);

  function handleTemplateSelect(template: any) {
    setSelectedTemplate(template);
    setGoalName(template.label);
    setGoalTarget(String(template.suggested));
    setGoalMonths(String(template.months));
    setShowTemplates(false);
  }

  async function handleCreateGoal() {
    if (!goalName || !goalTarget) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const newGoal = {
      id: Date.now(),
      name: goalName,
      target: parseFloat(goalTarget),
      saved: 0,
      months: parseInt(goalMonths) || 6,
      emoji: selectedTemplate?.emoji ?? "🎯",
      created: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
    setSelectedTemplate(null);
    setGoalName("");
    setGoalTarget("");
    setGoalMonths("");
    setSaving(false);
    toast({ title: "Goal created!", description: `${newGoal.name} — ${selected.symbol}${new Intl.NumberFormat("en-NG").format(newGoal.target)}` });
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background">
      <div className="w-full max-w-[430px] flex-1 flex flex-col">

        <header className="px-4 py-4 flex items-center sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <Button asChild variant="ghost" size="icon" className="w-10 h-10 rounded-full">
            <Link to="/dashboard"><ChevronLeft className="w-6 h-6" /></Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground absolute left-1/2 -translate-x-1/2">My Savings</h1>
          <Button variant="outline" size="icon" className="w-10 h-10 rounded-full border-primary/20 text-primary ml-auto"
            onClick={() => setShowTemplates(true)}>
            <Plus className="w-5 h-5" />
          </Button>
        </header>

        <main className="px-6 flex-1 flex flex-col gap-6 pb-12 pt-2">

          {/* Summary */}
          {goals.length > 0 && (
            <Card className="p-4 bg-primary/5 border-primary/15 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Saved</p>
                <p className="text-xl font-bold text-primary">{selected.symbol}{new Intl.NumberFormat("en-NG").format(totalSaved)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Active Goals</p>
                <p className="text-xl font-bold text-foreground">{goals.length}</p>
              </div>
            </Card>
          )}

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
              <div className="text-5xl">🎯</div>
              <div>
                <p className="text-lg font-bold text-foreground">No savings goals yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first goal to start saving</p>
              </div>
              <Button onClick={() => setShowTemplates(true)} className="rounded-2xl px-6">
                <Plus className="w-4 h-4 mr-2" /> Create a Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = Math.min((goal.saved / goal.target) * 100, 100);
                const monthly = Math.ceil((goal.target - goal.saved) / goal.months);
                return (
                  <Card key={goal.id} className="p-4 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{goal.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{goal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selected.symbol}{new Intl.NumberFormat("en-NG").format(goal.saved)} / {selected.symbol}{new Intl.NumberFormat("en-NG").format(goal.target)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Auto-saving {selected.symbol}{new Intl.NumberFormat("en-NG").format(monthly)}/month
                      </p>
                      <Button size="sm" variant="outline" className="text-xs rounded-xl border-primary/20 text-primary">
                        Add Funds
                      </Button>
                    </div>
                  </Card>
                );
              })}
              <button onClick={() => setShowTemplates(true)}
                className="w-full border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">Create a new savings goal</span>
              </button>
            </div>
          )}
        </main>

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
                  <h3 className="text-xl font-bold text-foreground">Choose a goal</h3>
                  <p className="text-sm text-muted-foreground mt-1">Pick a template or customize your own</p>
                </div>
                <button onClick={() => setShowTemplates(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="px-6 pb-6 pt-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {GOAL_TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => handleTemplateSelect(t)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors text-left">
                      <span className="text-2xl">{t.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{selected.symbol}{new Intl.NumberFormat("en-NG").format(t.suggested)}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => handleTemplateSelect({ emoji: "🎯", label: "", suggested: 0, months: 6 })}
                  className="w-full p-3 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
                  + Custom goal
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Customize Goal Sheet */}
      <AnimatePresence>
        {selectedTemplate !== null && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setSelectedTemplate(null)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-background rounded-t-[2rem] z-50 shadow-2xl border-t border-border">
              <div className="px-6 pt-5 pb-6">
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-4">Customize your goal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Goal name</label>
                    <input value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="e.g. New Laptop"
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Target amount ({selected.symbol})</label>
                    <input type="number" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} placeholder="0"
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-1.5 block">Months to save</label>
                    <input type="number" value={goalMonths} onChange={(e) => setGoalMonths(e.target.value)} placeholder="6"
                      className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <Button className="w-full h-14 rounded-2xl text-base font-semibold" disabled={!goalName || !goalTarget || saving} onClick={handleCreateGoal}>
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Goal"}
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
