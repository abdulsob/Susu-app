import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const RECENT_CONTACTS = [
  { id: "1", name: "Emeka Eze", phone: "···4821", initials: "EE" },
  { id: "2", name: "Adaeze Okafor", phone: "···2210", initials: "AO" },
  { id: "3", name: "Fatima Bello", phone: "···9034", initials: "FB" },
];

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000];
const BALANCE = 1240500;

export default function Send() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const [showModal, setShowModal] = useState(false);

  const formatCurrency = (val: string) => {
    if (!val) return "";
    const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("en-NG").format(num);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  const numericAmount = parseInt(amount, 10) || 0;

  const handleConfirm = () => {
    setShowModal(false);
    toast({
      title: "Money sent successfully!",
      description: `₦${formatCurrency(amount)} has been sent to ${recipient || "Unknown"}.`,
    });
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background pb-8">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full w-10 h-10" 
            onClick={() => navigate("/dashboard")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-lg font-bold text-foreground absolute left-1/2 -translate-x-1/2">Send Money</h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        <main className="px-6 flex-1 flex flex-col gap-8 mt-4">
          
          {/* Recipient Field */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-foreground px-1">Who are you sending to?</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Name, phone, or @susu tag" 
                className="pl-12 h-14 rounded-2xl bg-card border-card-border text-base shadow-sm focus-visible:ring-primary/20"
                data-testid="input-recipient"
              />
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x" style={{ scrollbarWidth: 'none' }}>
              {RECENT_CONTACTS.map((contact, i) => (
                <button
                  key={contact.id}
                  onClick={() => setRecipient(contact.name)}
                  className="flex items-center gap-3 p-2 pr-4 rounded-full bg-secondary hover:bg-secondary/80 border border-border/50 snap-start flex-shrink-0 transition-colors"
                  data-testid={`chip-contact-${i}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{contact.initials}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground leading-none">{contact.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{contact.phone}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Field */}
          <div className="space-y-4 mt-4">
            <label className="text-sm font-semibold text-foreground px-1 flex justify-center">Amount</label>
            <div className="relative flex justify-center items-center">
              <span className="text-4xl font-semibold text-foreground/50 mr-1">₦</span>
              <input 
                type="text"
                value={formatCurrency(amount)}
                onChange={handleAmountChange}
                placeholder="0"
                className="bg-transparent border-none text-5xl font-extrabold text-foreground w-full text-center focus:outline-none placeholder:text-muted focus:ring-0 max-w-[200px]"
                data-testid="input-amount"
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Available balance: ₦ {new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(BALANCE)}
            </p>

            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                  data-testid={`chip-amount-${amt}`}
                >
                  ₦{new Intl.NumberFormat("en-NG").format(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Note Field */}
          <div className="space-y-3 mt-4">
            <label className="text-sm font-semibold text-foreground px-1">Add a note (optional)</label>
            <Input 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this for?" 
              className="h-14 rounded-2xl bg-card border-card-border shadow-sm focus-visible:ring-primary/20"
              data-testid="input-note"
            />
          </div>

          <div className="mt-auto pt-8">
            <Button 
              className="w-full h-14 rounded-2xl text-base font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
              onClick={() => setShowModal(true)}
              disabled={!recipient || numericAmount <= 0 || numericAmount > BALANCE}
              data-testid="button-send"
            >
              {numericAmount > 0 ? `Send ₦${formatCurrency(amount)}` : "Send Money"}
            </Button>
          </div>
        </main>

        {/* Confirmation Modal */}
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
                className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-background rounded-t-[2rem] p-6 pb-safe z-50 border-t border-border shadow-2xl"
                data-testid="modal-send-confirm"
              >
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
                
                <h3 className="text-2xl font-bold text-center mb-8">Confirm Payment</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">To</span>
                    <span className="font-bold">{recipient || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">Amount</span>
                    <span className="font-bold text-lg">₦{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">Note</span>
                    <span className="font-medium">{note || "—"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-14 rounded-2xl font-bold border-border/50 bg-secondary/50"
                    onClick={() => setShowModal(false)}
                    data-testid="button-cancel-send"
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="h-14 rounded-2xl font-bold shadow-md shadow-primary/20"
                    onClick={handleConfirm}
                    data-testid="button-confirm-send"
                  >
                    Confirm Send
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
