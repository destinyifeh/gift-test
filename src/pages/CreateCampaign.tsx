import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, CheckCircle, Gift, Users, Star, CreditCard, Image, Link as LinkIcon, Globe, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";

const steps = ["Category", "Details", "Visibility", "Payment", "Review"];
const categories = [
  { id: "personal", label: "Personal Gift", icon: Gift, desc: "Birthday, anniversary, or special occasion" },
  { id: "group", label: "Group Gift", icon: Users, desc: "Pool contributions from friends and family" },
  { id: "creator", label: "Creator / Influencer", icon: Star, desc: "Accept gifts and appreciation from fans" },
  { id: "claimable", label: "Claimable / Prepaid", icon: CreditCard, desc: "Send a gift the recipient claims later" },
];

const CreateCampaign = () => {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [payment, setPayment] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [contributorsSeeEachOther, setContributorsSeeEachOther] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center px-4">
          <Card className="max-w-lg w-full border-border shadow-elevated">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">Campaign Created! 🎉</h2>
              <p className="text-muted-foreground mb-4">Your campaign is live and ready to share.</p>
              <div className="bg-muted rounded-lg p-3 flex items-center justify-center gap-2 mb-6">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-sm text-foreground">gifttogether.com/g/{title.toLowerCase().replace(/\s+/g, "-") || "my-campaign"}</span>
              </div>
              <div className="flex gap-3">
                <Link to="/dashboard" className="flex-1"><Button variant="outline" className="w-full">Go to Dashboard</Button></Link>
                <Link to="/campaign/birthday-gift-for-sarah" className="flex-1"><Button variant="hero" className="w-full">View Campaign</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold font-display text-foreground mb-2">Create Campaign</h1>
          <p className="text-muted-foreground mb-8">Set up your gift campaign in a few simple steps</p>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${i <= step ? "bg-gradient-hero text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <Card className="border-border">
            <CardContent className="p-6">
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Select Gift Type</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((c) => (
                      <button key={c.id} onClick={() => setCategory(c.id)} className={`p-4 rounded-xl border-2 text-left transition-all ${category === c.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                        <c.icon className={`w-6 h-6 mb-2 ${category === c.id ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="font-semibold text-foreground">{c.label}</p>
                        <p className="text-sm text-muted-foreground">{c.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Campaign Details</h2>
                  <div><Label htmlFor="title">Campaign Title</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Birthday Gift for Sarah" /></div>
                  <div><Label htmlFor="desc">Description</Label><Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell people about this gift campaign..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="goal">Goal Amount (optional)</Label><Input id="goal" type="number" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="$0" /></div>
                    <div><Label htmlFor="email">Recipient Email (optional)</Label><Input id="email" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="recipient@email.com" /></div>
                  </div>
                  <div>
                    <Label>Campaign Image</Label>
                    <div className="mt-1 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                      <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Campaign Visibility</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => setVisibility("public")}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${visibility === "public" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                    >
                      <Globe className={`w-6 h-6 mt-0.5 ${visibility === "public" ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-semibold text-foreground">Public Campaign</p>
                        <p className="text-sm text-muted-foreground">Anyone can see this campaign and contributions</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setVisibility("private")}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${visibility === "private" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                    >
                      <Lock className={`w-6 h-6 mt-0.5 ${visibility === "private" ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-semibold text-foreground">Private Campaign</p>
                        <p className="text-sm text-muted-foreground">Only invited people or link holders can see this campaign</p>
                      </div>
                    </button>
                  </div>

                  {visibility === "private" && (
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border">
                      <p className="font-medium text-foreground text-sm">Privacy Settings</p>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="see-each-other"
                          checked={contributorsSeeEachOther}
                          onCheckedChange={(v) => setContributorsSeeEachOther(!!v)}
                        />
                        <div>
                          <Label htmlFor="see-each-other" className="cursor-pointer font-medium">Contributors see each other</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">Invite-only social campaign — contributors can see who else contributed</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="no-see-each-other"
                          checked={!contributorsSeeEachOther}
                          onCheckedChange={(v) => setContributorsSeeEachOther(!v)}
                        />
                        <div>
                          <Label htmlFor="no-see-each-other" className="cursor-pointer font-medium">Contributors cannot see each other</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">Strictly private — no one can see who else contributed</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Payment Account</h2>
                  <p className="text-muted-foreground">Connect a payment account to receive contributions</p>
                  <div className="space-y-3">
                    {["Stripe", "Paystack", "Flutterwave"].map((p) => (
                      <button key={p} onClick={() => setPayment(p)} className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${payment === p ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                        <CreditCard className={`w-5 h-5 ${payment === p ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-semibold text-foreground">{p}</p>
                          <p className="text-sm text-muted-foreground">Connect your {p} account</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Review & Launch</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Category</span><Badge variant="secondary">{category || "—"}</Badge></div>
                    <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Title</span><span className="text-foreground font-medium">{title || "—"}</span></div>
                    <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Goal</span><span className="text-foreground font-medium">{goal ? `$${goal}` : "No goal"}</span></div>
                    <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Recipient</span><span className="text-foreground font-medium">{recipientEmail || "Public"}</span></div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Visibility</span>
                      <span className="text-foreground font-medium flex items-center gap-1">
                        {visibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {visibility === "public" ? "Public" : "Private"}
                      </span>
                    </div>
                    {visibility === "private" && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Contributors</span>
                        <span className="text-foreground font-medium text-sm">{contributorsSeeEachOther ? "Can see each other" : "Cannot see each other"}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2"><span className="text-muted-foreground">Payment</span><span className="text-foreground font-medium">{payment || "—"}</span></div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={prev} disabled={step === 0}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                {step < steps.length - 1 ? (
                  <Button variant="hero" onClick={next}> Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
                ) : (
                  <Button variant="hero" onClick={() => setSubmitted(true)}>Launch Campaign 🚀</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
