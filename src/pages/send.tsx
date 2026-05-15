import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Search, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePrivy } from "@privy-io/react-auth";
import { useCurrency } from "@/context/currency";
import { sendMoney, getUserBalance } from "@/lib/supabase";

export default function Send() {
  const { user } = usePrivy();
  const navigate = useNavigate();
  const { selected } = useCurrency();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const quickAmounts = [5000, 10000, 25000, 50000];

  async function handleSend() {
    if (!recipient || numericAmount <= 0) return;
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Check balance first
      const balance = await getUserBalance(user.id);
      if (balance < numericAmount) {
        setError("Insufficient balance. Please add money first.");
        setLoading(false);
        return;
      }

      await sendMoney(user.id, recipient.trim().toLowerCase(), numericAmount, note, selected.currency);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background">
        <div className="w-full max-w-[430px] flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Money Sent!</h2>
            <p className="text-muted-foreground mt-2">
              {selected.symbol}{new Intl.NumberFormat("en-NG").format(numericAmount)} sent to {recipient}
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => { setSuccess(false); setRecipient(""); setAmount(""); setNote(""); }}>
              Send Again
            </Button>
            <Button asChild className="flex-1">
              <Link to="/dashboard">Done</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background">
      <div className="w-full max-w-[430px] flex-1 flex flex-col">

        <header className="px-4 py-4 flex items-center sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <Button asChild variant="ghost" size="icon" className="w-10 h-10 rounded-full">
            <Link to="/dashboard"><ChevronLeft className="w-6 h-6" /></Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground absolute left-1/2 -translate-x-1/2">Send Money</h1>
        </header>

        <main className="px-6 flex-1 flex flex-col gap-6 pb-8 pt-2">

          {/* Recipient */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Who are you sending to?</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Enter their email address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Enter the email address of another Susu user</p>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Amount</label>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-3">
              <span className="text-2xl font-bold text-muted-foreground">{selected.symbol}</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-3xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 mt-3">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="flex-1 py-1.5 rounded-xl bg-muted/50 text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {selected.symbol}{new Intl.NumberFormat("en-NG").format(a)}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Add a note (optional)</label>
            <input
              type="text"
              placeholder="What's this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-600"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto">
            <Button
              className="w-full h-14 text-base font-semibold rounded-2xl"
              disabled={!recipient || numericAmount <= 0 || loading}
              onClick={handleSend}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : numericAmount > 0 ? (
                `Send ${selected.symbol}${new Intl.NumberFormat("en-NG").format(numericAmount)}`
              ) : (
                "Enter an amount"
              )}
            </Button>
          </div>

        </main>
      </div>
    </div>
  );
}
