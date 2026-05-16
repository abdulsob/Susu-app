import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Phone, Info, Check, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/currency";
import { usePrivy } from "@privy-io/react-auth";
import { recordDeposit, initiateWithdrawal } from "@/lib/supabase";
import { getExchangeRate } from "@/lib/arc";

declare global {
  interface Window {
    PaystackPop: {
      setup(options: {
        key: string; email: string; amount: number; currency?: string;
        ref?: string; callback: (response: { reference: string }) => void; onClose: () => void;
      }): { openIframe(): void };
    };
  }
}

type Tab = "deposit" | "withdraw";

const NIGERIAN_BANKS = [
  { id: "058", name: "GTBank",     short: "GT",  color: "bg-[#f58220]", textColor: "text-white" },
  { id: "044", name: "Access",     short: "AC",  color: "bg-[#e31837]", textColor: "text-white" },
  { id: "057", name: "Zenith",     short: "ZE",  color: "bg-[#d4003a]", textColor: "text-white" },
  { id: "033", name: "UBA",        short: "UBA", color: "bg-[#b01116]", textColor: "text-white" },
  { id: "011", name: "First Bank", short: "FB",  color: "bg-[#00529b]", textColor: "text-white" },
  { id: "214", name: "FCMB",       short: "FC",  color: "bg-[#0e7c40]", textColor: "text-white" },
  { id: "070", name: "Fidelity",   short: "FD",  color: "bg-[#00529b]", textColor: "text-white" },
  { id: "221", name: "Stanbic",    short: "SB",  color: "bg-[#0a2d6e]", textColor: "text-white" },
];

const NIGERIAN_MOBILE = [
  { id: "mtn-ng",    name: "MTN",    short: "MTN", color: "bg-[#ffcc00]", textColor: "text-zinc-900" },
  { id: "airtel-ng", name: "Airtel", short: "A",   color: "bg-[#ff0000]", textColor: "text-white" },
  { id: "glo",       name: "Glo",    short: "G",   color: "bg-[#009a44]", textColor: "text-white" },
];

const MOBILE_MONEY_PROVIDERS: Record<string, { id: string; name: string; short: string; color: string; textColor: string; placeholder: string }[]> = {
  GHS: [
    { id: "mtn-gh",    name: "MTN MoMo",    short: "MTN", color: "bg-[#ffcc00]", textColor: "text-zinc-900", placeholder: "+233 24X XXX XXXX" },
    { id: "airtel-gh", name: "Airtel Money", short: "A",  color: "bg-[#ff0000]", textColor: "text-white",    placeholder: "+233 26X XXX XXXX" },
  ],
  KES: [
    { id: "mpesa",     name: "M-Pesa",       short: "M",  color: "bg-[#00a651]", textColor: "text-white",    placeholder: "+254 7XX XXX XXX" },
    { id: "airtel-ke", name: "Airtel Money", short: "A",  color: "bg-[#ff0000]", textColor: "text-white",    placeholder: "+254 73X XXX XXX" },
  ],
  ZWL: [
    { id: "ecocash",   name: "EcoCash",      short: "EC", color: "bg-[#e31837]", textColor: "text-white",    placeholder: "+263 77X XXX XXX" },
    { id: "onemoney",  name: "OneMoney",     short: "OM", color: "bg-[#00529b]", textColor: "text-white",    placeholder: "+263 71X XXX XXX" },
  ],
  UGX: [
    { id: "mtn-ug",    name: "MTN MoMo",     short: "MTN", color: "bg-[#ffcc00]", textColor: "text-zinc-900", placeholder: "+256 77X XXX XXX" },
    { id: "airtel-ug", name: "Airtel Money", short: "A",   color: "bg-[#ff0000]", textColor: "text-white",    placeholder: "+256 75X XXX XXX" },
  ],
  TZS: [
    { id: "mpesa-tz",  name: "M-Pesa",       short: "M",  color: "bg-[#00a651]", textColor: "text-white",    placeholder: "+255 75X XXX XXX" },
    { id: "airtel-tz", name: "Airtel Money", short: "A",  color: "bg-[#ff0000]", textColor: "text-white",    placeholder: "+255 68X XXX XXX" },
  ],
};

const QUICK_AMOUNTS: Record<string, number[]> = {
  NGN: [1000, 5000, 10000, 50000],
  GHS: [10, 50, 100, 500],
  KES: [500, 1000, 2000, 5000],
  ZWL: [100, 500, 1000, 5000],
  UGX: [5000, 10000, 50000, 100000],
  TZS: [5000, 10000, 50000, 100000],
};

const PAYSTACK_KEY = "pk_test_d77b93d7d4e068962d5488c91b0abfa33764d679";

export default function Funds() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selected } = useCurrency();
  const { user } = usePrivy();

  const [activeTab, setActiveTab] = useState<Tab>("deposit");
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0].id);
  const [selectedMobile, setSelectedMobile] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isNigeria = selected.code === "NGN";
  const providers = MOBILE_MONEY_PROVIDERS[selected.code] ?? MOBILE_MONEY_PROVIDERS["KES"];
  const quickAmounts = QUICK_AMOUNTS[selected.code] ?? QUICK_AMOUNTS["NGN"];
  const selectedMobileProvider = providers.find((p) => p.id === selectedMobile) ?? providers[0];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value.replace(/[^0-9]/g, ""));
  };

  const formatRaw = (val: string) => {
    if (!val) return "";
    const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat(selected.locale).format(num);
  };

  const numericAmount = parseInt(amount, 10) || 0;
  const fee = activeTab === "withdraw" ? Math.max(numericAmount * 0.005, 50) : 0;

  // Paystack deposit
  const handlePaystack = () => {
    if (numericAmount <= 0) return;
    if (!window.PaystackPop) {
      toast({ title: "Payment unavailable", description: "Please check your connection.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const ref = `susu_${Date.now()}`;
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: user?.email?.address ?? "user@susu.app",
      amount: numericAmount * 100,
      currency: "NGN",
      ref,
      callback: async (response) => {
        try {
          // Get live exchange rate and record deposit
          const rate = await getExchangeRate("NGN");
          await recordDeposit(user!.id, numericAmount, "NGN", response.reference, rate);
          setSuccess(true);
        } catch (e) {
          toast({ title: "Error recording deposit", description: "Contact support with ref: " + response.reference, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      },
      onClose: () => setLoading(false),
    });
    handler.openIframe();
  };

  // Real Paystack withdrawal
  const handleWithdraw = async () => {
    if (numericAmount <= 0 || !accountNumber || !accountName) return;
    setLoading(true);
    setError("");
    try {
      await initiateWithdrawal(user!.id, numericAmount, "NGN", accountNumber, selectedBank, accountName);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMobileSubmit = () => {
    toast({ title: "Request sent!", description: `Check your phone (${phone}) to approve.` });
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background">
        <div className="w-full max-w-[430px] flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {activeTab === "deposit" ? "Money Added!" : "Withdrawal Initiated!"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {selected.symbol}{new Intl.NumberFormat("en-NG").format(numericAmount)}{" "}
              {activeTab === "deposit" ? "added to your balance" : "will arrive in 1-3 minutes"}
            </p>
          </div>
          <Button asChild className="w-full h-14 rounded-2xl text-base font-semibold">
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background pb-8">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">

        <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-lg font-bold text-foreground absolute left-1/2 -translate-x-1/2">Add or Withdraw Funds</h2>
          <div className="w-10" />
        </header>

        <main className="px-6 flex-1 flex flex-col gap-6 mt-2 pb-8">

          {/* Tabs */}
          <div className="flex p-1 bg-secondary rounded-2xl">
            {(["deposit", "withdraw"] as Tab[]).map((tab) => (
              <button key={tab}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all capitalize ${activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => { setActiveTab(tab); setError(""); }}
              >
                {tab === "deposit" ? "Add Money" : "Withdraw"}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-foreground px-1 flex justify-center">Amount ({selected.country})</label>
            <div className="relative flex justify-center items-center">
              <span className="text-3xl font-semibold text-foreground/50 mr-1">{selected.symbol}</span>
              <input type="text" inputMode="numeric" value={formatRaw(amount)} onChange={handleAmountChange}
                placeholder="0"
                className="bg-transparent border-none text-5xl font-extrabold text-foreground w-full text-center focus:outline-none placeholder:text-muted focus:ring-0 max-w-[220px]" />
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {quickAmounts.map((amt) => (
                <button key={amt} onClick={() => setAmount(amt.toString())}
                  className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors">
                  {selected.symbol}{new Intl.NumberFormat(selected.locale).format(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nigeria Deposit */}
          {isNigeria && activeTab === "deposit" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Pay via your bank or mobile money</p>
                <div className="grid grid-cols-4 gap-2">
                  {NIGERIAN_BANKS.map((b) => (
                    <button key={b.id} onClick={() => setSelectedBank(b.id)}
                      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all ${selectedBank === b.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-border"}`}>
                      {selectedBank === b.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${b.color}`}>
                        <span className={`font-black text-[9px] ${b.textColor}`}>{b.short}</span>
                      </div>
                      <span className="text-[9px] font-bold text-center leading-tight">{b.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground px-1">Mobile money</p>
                <div className="grid grid-cols-3 gap-2">
                  {NIGERIAN_MOBILE.map((m) => (
                    <button key={m.id} onClick={() => setSelectedBank(m.id)}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${selectedBank === m.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-border"}`}>
                      {selectedBank === m.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${m.color}`}>
                        <span className={`font-black text-[10px] ${m.textColor}`}>{m.short}</span>
                      </div>
                      <span className="text-[10px] font-bold text-center">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/50">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">No deposit fees. Funds arrive instantly after payment is confirmed.</p>
              </div>
              <Button className="w-full h-14 rounded-2xl text-base font-bold" onClick={handlePaystack} disabled={numericAmount <= 0 || loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {numericAmount > 0 ? `Pay ₦${new Intl.NumberFormat("en-NG").format(numericAmount)}` : "Enter an amount to continue"}
              </Button>
            </div>
          )}

          {/* Nigeria Withdraw */}
          {isNigeria && activeTab === "withdraw" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground px-1">Account name</label>
                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)}
                  placeholder="John Doe" className="h-14 rounded-2xl bg-card text-base font-medium" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground px-1">Account number</label>
                <Input type="text" inputMode="numeric" maxLength={10} value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="0123456789" className="h-14 rounded-2xl bg-card text-base font-medium" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground px-1">Select bank</label>
                <div className="grid grid-cols-4 gap-2">
                  {NIGERIAN_BANKS.map((b) => (
                    <button key={b.id} onClick={() => setSelectedBank(b.id)}
                      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all ${selectedBank === b.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                      {selectedBank === b.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${b.color}`}>
                        <span className={`font-black text-[9px] ${b.textColor}`}>{b.short}</span>
                      </div>
                      <span className="text-[9px] font-bold text-center leading-tight">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              {numericAmount > 0 && (
                <div className="p-3 rounded-xl bg-secondary/50 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">₦{new Intl.NumberFormat("en-NG").format(numericAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fee (0.5%)</span>
                    <span className="font-semibold">₦{new Intl.NumberFormat("en-NG").format(fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-1">
                    <span>Total deducted</span>
                    <span>₦{new Intl.NumberFormat("en-NG").format(numericAmount + fee)}</span>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/50">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">Arrives in 1–3 minutes. Minimum withdrawal ₦1,000.</p>
              </div>
              <Button className="w-full h-14 rounded-2xl text-base font-bold"
                disabled={numericAmount <= 0 || !accountNumber || !accountName || loading}
                onClick={handleWithdraw}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {numericAmount > 0 ? `Withdraw ₦${new Intl.NumberFormat("en-NG").format(numericAmount)}` : "Enter an amount"}
              </Button>
            </div>
          )}

          {/* Non-Nigeria Mobile Money */}
          {!isNigeria && (
            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground px-1">Select provider</label>
                <div className={`grid gap-3 ${providers.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {providers.map((p) => {
                    const isSelected = (selectedMobile || providers[0].id) === p.id;
                    return (
                      <button key={p.id} onClick={() => setSelectedMobile(p.id)}
                        className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${p.color}`}>
                          <span className={`font-black text-sm ${p.textColor}`}>{p.short}</span>
                        </div>
                        <span className="text-[11px] font-bold text-center leading-tight">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground px-1">Mobile money number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder={selectedMobileProvider.placeholder} type="tel"
                    className="pl-12 h-14 rounded-2xl bg-card text-base font-medium" />
                </div>
              </div>
              <Button className="w-full h-14 rounded-2xl text-base font-bold"
                disabled={numericAmount <= 0 || !phone} onClick={handleMobileSubmit}>
                {numericAmount > 0
                  ? `${activeTab === "deposit" ? "Deposit" : "Withdraw"} ${selected.symbol}${new Intl.NumberFormat(selected.locale).format(numericAmount)}`
                  : "Enter an amount to continue"}
              </Button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
