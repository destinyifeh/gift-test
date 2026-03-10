import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, CheckCircle, Mail, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const giftData = {
  code: "ABX82H",
  senderName: "John",
  giftName: "$50 Spa Gift Card",
  vendor: "Relax Spa",
  amount: 50,
  message: "Thank you for everything! Enjoy some relaxation 💆",
};

const ClaimGift = () => {
  const [step, setStep] = useState<"view" | "claim" | "done">("view");
  const [email, setEmail] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <Gift className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold font-display text-foreground">GiftTogether</span>
          </Link>
        </div>

        {step === "view" && (
          <Card className="border-border shadow-elevated">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold font-display text-foreground mb-2">🎉 {giftData.senderName} sent you a gift!</h1>
              <div className="bg-muted rounded-xl p-4 my-6 text-left space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Gift</span><span className="font-medium text-foreground">{giftData.giftName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="font-medium text-foreground">{giftData.vendor}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Value</span><span className="font-bold text-primary">${giftData.amount}</span></div>
              </div>
              {giftData.message && (
                <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-muted-foreground mb-1">Personal message:</p>
                  <p className="text-foreground italic">"{giftData.message}"</p>
                </div>
              )}
              <Button variant="hero" className="w-full h-12" onClick={() => setStep("claim")}>Claim This Gift</Button>
            </CardContent>
          </Card>
        )}

        {step === "claim" && (
          <Card className="border-border shadow-elevated">
            <CardContent className="p-6 space-y-5">
              <h2 className="text-xl font-bold font-display text-foreground">Claim Your Gift</h2>
              <p className="text-muted-foreground text-sm">Enter your details to receive this gift</p>

              <div className="space-y-2">
                <Label htmlFor="claim-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="claim-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="pl-10" />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Payout Method</Label>
                {["Bank Transfer", "Stripe", "Paystack"].map((m) => (
                  <button key={m} onClick={() => setPayoutMethod(m)} className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${payoutMethod === m ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <CreditCard className={`w-5 h-5 ${payoutMethod === m ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium text-foreground">{m}</span>
                  </button>
                ))}
              </div>

              <Button variant="hero" className="w-full h-12" onClick={() => setStep("done")} disabled={!email || !payoutMethod}>
                Claim Gift
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "done" && (
          <Card className="border-border shadow-elevated">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">Gift Claimed! 🎉</h2>
              <p className="text-muted-foreground mb-6">Your {giftData.giftName} has been claimed. You'll receive it at {email}.</p>
              <div className="flex gap-3 justify-center">
                <Link to="/signup"><Button variant="outline">Create Account</Button></Link>
                <Link to="/"><Button variant="hero">Go Home</Button></Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClaimGift;
