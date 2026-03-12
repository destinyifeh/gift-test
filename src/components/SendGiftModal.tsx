import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, CreditCard, Heart, CheckCircle } from "lucide-react";

interface SendGiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignTitle?: string;
  recipientName?: string;
}

const presetAmounts = [5, 10, 25, 50, 100];

const vendorGifts = [
  { id: 1, name: "☕ Coffee Gift Card", price: 10, vendor: "Brew House" },
  { id: 2, name: "🎂 Cake Gift Card", price: 25, vendor: "Sweet Bakes" },
  { id: 3, name: "💆 Spa Voucher", price: 50, vendor: "Relax Spa" },
  { id: 4, name: "🎮 Gaming Credit", price: 20, vendor: "GameZone" },
];

const SendGiftModal = ({ open, onOpenChange, campaignTitle, recipientName }: SendGiftModalProps) => {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [hideAmount, setHideAmount] = useState(false);
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [step, setStep] = useState<"details" | "success">("details");

  const handleSubmit = () => {
    setStep("success");
  };

  const handleClose = () => {
    setStep("details");
    setAmount(null);
    setCustomAmount("");
    setMessage("");
    setAnonymous(false);
    setHideAmount(false);
    setSelectedGift(null);
    onOpenChange(false);
  };

  const finalAmount = amount || (customAmount ? Number(customAmount) : 0);
  const target = campaignTitle || recipientName || "this campaign";

  if (step === "success") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h2 className="text-xl font-bold font-display text-foreground mb-2">Gift Sent! 🎉</h2>
            <p className="text-muted-foreground mb-6">Your {selectedGift ? "gift" : `$${finalAmount}`} contribution to {target} has been processed.</p>
            <Button variant="hero" onClick={handleClose}>Done</Button>
            <p className="text-xs text-muted-foreground mt-4">Powered by <span className="font-semibold text-primary">GiftTogether</span></p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" /> Send a Gift
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Contributing to {target}</p>
        </DialogHeader>

        <Tabs defaultValue="money" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="money" className="gap-2"><CreditCard className="w-4 h-4" /> Money</TabsTrigger>
            <TabsTrigger value="vendor" className="gap-2"><Gift className="w-4 h-4" /> Vendor Gift</TabsTrigger>
          </TabsList>

          <TabsContent value="money" className="space-y-4 mt-4">
            <div>
              <Label>Select Amount</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {presetAmounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${amount === a ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/30"}`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }}
                  className="text-center"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vendor" className="space-y-3 mt-4">
            <Label>Select a Gift</Label>
            {vendorGifts.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGift(g.id)}
                className={`w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all ${selectedGift === g.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
              >
                <div>
                  <p className="font-semibold text-foreground">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{g.vendor}</p>
                </div>
                <span className="font-bold text-primary">${g.price}</span>
              </button>
            ))}
          </TabsContent>
        </Tabs>

        {/* Message */}
        <div className="space-y-2">
          <Label>Message (optional)</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a personal note..." rows={2} />
        </div>

        {/* Privacy */}
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground">Privacy</p>
          <div className="flex items-center gap-2">
            <Checkbox id="anon" checked={anonymous} onCheckedChange={(v) => setAnonymous(!!v)} />
            <Label htmlFor="anon" className="text-sm font-normal cursor-pointer">Make my contribution anonymous</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="hideamt" checked={hideAmount} onCheckedChange={(v) => setHideAmount(!!v)} />
            <Label htmlFor="hideamt" className="text-sm font-normal cursor-pointer">Hide contribution amount</Label>
          </div>
        </div>

        <Button variant="hero" className="w-full h-12 mt-2" onClick={handleSubmit} disabled={!finalAmount && !selectedGift}>
          <Heart className="w-4 h-4 mr-2" /> Send Gift {finalAmount > 0 && `— $${finalAmount}`}
        </Button>

        <p className="text-xs text-center text-muted-foreground">Powered by <span className="font-semibold text-primary">GiftTogether</span></p>
      </DialogContent>
    </Dialog>
  );
};

export default SendGiftModal;
