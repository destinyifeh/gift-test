import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Globe, Users, DollarSign, Key, Code, Settings, Palette, Crown, Gift,
  CheckCircle, ArrowRight, BarChart3, CreditCard, ShoppingCart, Zap
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const PlatformPartner = () => {
  const [applied, setApplied] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState("");
  const [integrationType, setIntegrationType] = useState("");

  if (!applied) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Platform Partners</Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
                Integrate Gifting Into <span className="text-gradient">Your Platform</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Let your users send and receive gifts without building payment infrastructure. Earn revenue on every transaction.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Zap, title: "Quick Integration", desc: "Widget, SDK, or full API — integrate in minutes" },
                { icon: DollarSign, title: "Revenue Share", desc: "Earn on every gift transaction on your platform" },
                { icon: Palette, title: "White-Label Option", desc: "Full branding control — your name, your colors" },
              ].map((b) => (
                <Card key={b.title} className="border-border">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mx-auto mb-4">
                      <b.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Revenue Example */}
            <Card className="border-border mb-12">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 text-center">Revenue Share Example</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 font-medium">Item</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                    </tr></thead>
                    <tbody>
                      <tr className="border-b border-border"><td className="py-2 text-foreground">User pays</td><td className="py-2 text-right font-semibold text-foreground">$50.00</td></tr>
                      <tr className="border-b border-border"><td className="py-2 text-foreground">GiftTogether fee</td><td className="py-2 text-right text-muted-foreground">$1.00</td></tr>
                      <tr className="border-b border-border"><td className="py-2 text-foreground">Partner platform fee</td><td className="py-2 text-right text-secondary font-semibold">$1.00</td></tr>
                      <tr><td className="py-2 text-foreground font-semibold">Creator receives</td><td className="py-2 text-right font-bold text-foreground">$48.00</td></tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Tiers */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-1">Free / Basic Integration</h3>
                  <p className="text-2xl font-bold text-foreground mb-3">$0</p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-secondary" /> Widget, SDK, or API integration</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-secondary" /> Standard revenue share</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-secondary" /> "Powered by GiftTogether" branding</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-secondary" /> Basic analytics</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-accent/30 bg-accent/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2"><Crown className="w-4 h-4 text-accent" /> White-Label</h3>
                  <p className="text-2xl font-bold text-foreground mb-3">Custom Pricing</p>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-secondary" /> Remove all GiftTogether branding</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-secondary" /> Custom name, logo, and colors</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-secondary" /> Higher API limits</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-secondary" /> Advanced analytics</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-secondary" /> Priority support</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-secondary" /> Custom notifications/emails</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Application Form */}
            <Card className="border-border">
              <CardHeader><CardTitle className="text-lg font-display">Become a Platform Partner</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Company Name</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company" /></div>
                  <div className="space-y-2"><Label>Platform Website</Label><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourplatform.com" /></div>
                  <div className="space-y-2"><Label>Contact Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="partner@company.com" /></div>
                  <div className="space-y-2"><Label>Estimated Users</Label><Input value={users} onChange={(e) => setUsers(e.target.value)} placeholder="e.g., 10,000" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Integration Type</Label>
                  <Select value={integrationType} onValueChange={setIntegrationType}>
                    <SelectTrigger><SelectValue placeholder="Select integration type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="widget">Website Widget</SelectItem>
                      <SelectItem value="sdk">Mobile SDK</SelectItem>
                      <SelectItem value="api">Full API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="hero" className="w-full" onClick={() => setApplied(true)}>
                  Apply for Partnership <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* How it works */}
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">How It Works</h2>
              <p className="text-muted-foreground mb-8">From signup to live integration in 4 steps</p>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: 1, title: "Sign Up", desc: "Register as a platform partner" },
                  { step: 2, title: "Get API Keys", desc: "Generate public & secret keys" },
                  { step: 3, title: "Integrate", desc: "Add widget, SDK, or API" },
                  { step: 4, title: "Earn Revenue", desc: "Earn on every transaction" },
                ].map((s) => (
                  <div key={s.step} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-hero text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto mb-3">{s.step}</div>
                    <h4 className="font-semibold text-foreground mb-1">{s.title}</h4>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Note about partner users */}
            <Card className="border-border mt-12">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Important: Partner Platform Users</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Users created via the partner API exist only in the context of the partner platform.</li>
                  <li>• They cannot log in to GiftTogether.com directly.</li>
                  <li>• Gifts and funds are managed through the partner platform.</li>
                  <li>• Payouts to partner users are processed through the partner's configured payout method.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Platform Partner Dashboard (after signup)
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">Platform Dashboard</h1>
              <p className="text-muted-foreground">Manage your integration, users, and revenue</p>
            </div>
            <Badge variant="secondary">Partner</Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Users", value: "1,240", icon: Users },
              { label: "Transactions", value: "3,456", icon: ShoppingCart },
              { label: "Revenue Share", value: "$1,280", icon: DollarSign },
              { label: "Active Gifts", value: "89", icon: Gift },
            ].map((s) => (
              <Card key={s.label} className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><s.icon className="w-5 h-5" /></div>
                  <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="border-border">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                  <p>Transaction analytics and insights coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-4">
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">API Keys</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Public Key</Label>
                      <code className="block bg-muted rounded-lg px-4 py-3 font-mono text-sm text-foreground mt-1">pk_live_9384kdj3f8a7b6c5d</code>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Secret Key</Label>
                      <code className="block bg-muted rounded-lg px-4 py-3 font-mono text-sm text-foreground mt-1">sk_live_••••••••••••••••</code>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Regenerate Keys</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Registered Users</h3>
                  <div className="space-y-3">
                    {[
                      { id: "1234", username: "john", email: "john@partner.com", gifts: 12 },
                      { id: "5678", username: "sarah", email: "sarah@partner.com", gifts: 8 },
                      { id: "9012", username: "alex", email: "alex@partner.com", gifts: 3 },
                    ].map((u) => (
                      <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">@{u.username}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <Badge variant="outline">{u.gifts} gifts</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue">
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Revenue Share</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted rounded-xl"><p className="text-2xl font-bold text-foreground">$1,280</p><p className="text-xs text-muted-foreground">Total Earned</p></div>
                    <div className="text-center p-4 bg-muted rounded-xl"><p className="text-2xl font-bold text-foreground">$340</p><p className="text-xs text-muted-foreground">This Month</p></div>
                    <div className="text-center p-4 bg-muted rounded-xl"><p className="text-2xl font-bold text-foreground">2%</p><p className="text-xs text-muted-foreground">Commission Rate</p></div>
                  </div>
                  <Button variant="hero"><ArrowRight className="w-4 h-4 mr-2" /> Request Payout</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <Card className="border-border">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2"><Crown className="w-4 h-4 text-accent" /> White-Label Mode</h3>
                      <p className="text-sm text-muted-foreground">Remove all GiftTogether branding</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="border-t border-border pt-4 space-y-4">
                    <div className="space-y-2"><Label>Brand Name</Label><Input placeholder="Community Gifts" /></div>
                    <div className="space-y-2"><Label>Primary Color</Label><Input placeholder="#FF5500" /></div>
                    <div className="space-y-2"><Label>Logo URL</Label><Input placeholder="https://yourplatform.com/logo.png" /></div>
                  </div>
                  <Button variant="hero">Save Branding</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PlatformPartner;
