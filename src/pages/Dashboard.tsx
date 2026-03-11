import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Gift, Send, Clock, DollarSign, Users, ArrowUpRight, Plus, LayoutDashboard,
  Heart, Wallet, Settings, Star, Code, BarChart3, Eye, Sparkles, Globe,
  CreditCard, Camera, Link as LinkIcon, LogOut, Menu, X, ChevronRight, User
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";

const sentGifts = [
  { id: 1, name: "Birthday Gift for Sarah", recipient: "sarah@email.com", amount: 50, status: "delivered", date: "2026-03-05" },
  { id: 2, name: "Wedding Gift Pool", recipient: "couple@email.com", amount: 150, status: "pending", date: "2026-03-08" },
  { id: 3, name: "Thank You - Ms. Johnson", recipient: "teacher@email.com", amount: 30, status: "claimed", date: "2026-02-28" },
];

const receivedGifts = [
  { id: 1, name: "$50 Spa Gift Card", sender: "John D.", amount: 50, code: "SPA-4821", status: "unclaimed", date: "2026-03-07" },
  { id: 2, name: "$25 Cake Gift Card", sender: "Sarah M.", amount: 25, code: "CAKE-7293", status: "claimed", date: "2026-03-01" },
  { id: 3, name: "Creator Appreciation", sender: "Multiple fans", amount: 120, code: null, status: "withdrawable", date: "2026-03-06" },
];

const contributions = [
  { id: 1, campaign: "Wedding Gift for Alex & Kim", contributed: 75, goal: 500, progress: 68, contributors: 12 },
  { id: 2, campaign: "Birthday Fund for Mom", contributed: 30, goal: 200, progress: 85, contributors: 8 },
];

const myCampaigns = [
  { id: 1, title: "Birthday Gift for Sarah 🎂", slug: "birthday-gift-for-sarah", raised: 340, goal: 500, contributors: 12, status: "active", daysLeft: 5 },
  { id: 2, title: "Team Appreciation Fund", slug: "team-appreciation", raised: 200, goal: 200, contributors: 8, status: "completed", daysLeft: 0 },
];

const walletData = {
  balance: 195,
  pending: 50,
  totalWithdrawn: 320,
  transactions: [
    { id: 1, type: "received", desc: "Gift from John D.", amount: 50, date: "2026-03-07" },
    { id: 2, type: "received", desc: "Gift from Sarah M.", amount: 25, date: "2026-03-06" },
    { id: 3, type: "withdrawn", desc: "Withdrawal to Stripe", amount: -100, date: "2026-03-04" },
    { id: 4, type: "received", desc: "Creator gift (fans)", amount: 120, date: "2026-03-03" },
  ],
};

const supporters = [
  { id: 1, name: "John D.", amount: 50, message: "Great work!", date: "2026-03-08" },
  { id: 2, name: "Sarah M.", amount: 25, message: "Keep building!", date: "2026-03-07" },
  { id: 3, name: "Anonymous", amount: 5, message: "", date: "2026-03-06" },
  { id: 4, name: "Mary K.", amount: 100, message: "You're amazing 🎉", date: "2026-03-05" },
];

const statusColor = (s: string) => {
  if (s === "delivered" || s === "claimed" || s === "completed") return "secondary";
  if (s === "pending" || s === "unclaimed" || s === "active") return "outline";
  return "default";
};

type Section = "overview" | "sent" | "received" | "contributions" | "campaigns" | "wallet" | "settings" | "gift-page" | "supporters" | "analytics" | "integrations";

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sent", label: "Gifts Sent", icon: Send },
  { id: "received", label: "Gifts Received", icon: Gift },
  { id: "contributions", label: "Contributions", icon: Heart },
  { id: "campaigns", label: "Campaigns", icon: Users },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
];

const creatorNavItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "gift-page", label: "My Gift Page", icon: Sparkles },
  { id: "supporters", label: "Supporters", icon: Heart },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "integrations", label: "Integrations", icon: Code },
];

const Dashboard = () => {
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creatorEnabled, setCreatorEnabled] = useState(false);
  const navigate = useNavigate();

  // Mock user
  const user = { name: "Destiny O.", username: "destiny", email: "destiny@email.com" };

  const renderSidebar = () => (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">D</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setSection(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${section === item.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </button>
        ))}

        {/* Creator section */}
        <div className="pt-4 mt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Creator</p>
          {!creatorEnabled ? (
            <button
              onClick={() => setCreatorEnabled(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              Enable Gift Page
            </button>
          ) : (
            creatorNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${section === item.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            ))
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Link to="/">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Gift className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display text-foreground">GiftTogether</span>
          </Link>
        </div>
        {renderSidebar()}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                  <Gift className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold font-display text-foreground">GiftTogether</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            {renderSidebar()}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5 text-foreground" /></button>
            <h1 className="text-lg font-semibold font-display text-foreground capitalize">{section.replace("-", " ")}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/create-campaign"><Button variant="hero" size="sm"><Plus className="w-4 h-4 mr-1" /> New Campaign</Button></Link>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-5xl">
          {/* OVERVIEW */}
          {section === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Gifts Sent", value: "12", icon: Send, color: "text-primary" },
                  { label: "Gifts Received", value: "8", icon: Gift, color: "text-secondary" },
                  { label: "Total Given", value: "$430", icon: DollarSign, color: "text-accent" },
                  { label: "Campaigns", value: "3", icon: Users, color: "text-primary" },
                ].map((s) => (
                  <Card key={s.label} className="border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent activity */}
              <Card className="border-border">
                <CardHeader><CardTitle className="text-base font-body">Recent Activity</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {sentGifts.slice(0, 2).map((g) => (
                    <div key={g.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Send className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{g.name}</p>
                          <p className="text-xs text-muted-foreground">{g.date}</p>
                        </div>
                      </div>
                      <Badge variant={statusColor(g.status) as any}>{g.status}</Badge>
                    </div>
                  ))}
                  {receivedGifts.slice(0, 2).map((g) => (
                    <div key={g.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Gift className="w-4 h-4 text-secondary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{g.name}</p>
                          <p className="text-xs text-muted-foreground">{g.date}</p>
                        </div>
                      </div>
                      <Badge variant={statusColor(g.status) as any}>{g.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {!creatorEnabled && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Enable Your Gift Page</h3>
                      <p className="text-sm text-muted-foreground mt-1">Let people send you gifts at gifttogether.com/{user.username}</p>
                    </div>
                    <Button variant="hero" size="sm" onClick={() => { setCreatorEnabled(true); setSection("gift-page"); }}>Enable</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* GIFTS SENT */}
          {section === "sent" && (
            <div className="space-y-4">
              {sentGifts.map((g) => (
                <Card key={g.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Send className="w-5 h-5 text-primary" /></div>
                      <div>
                        <p className="font-semibold text-foreground">{g.name}</p>
                        <p className="text-sm text-muted-foreground">To: {g.recipient} · {g.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">${g.amount}</span>
                      <Badge variant={statusColor(g.status) as any}>{g.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* GIFTS RECEIVED */}
          {section === "received" && (
            <div className="space-y-4">
              {receivedGifts.map((g) => (
                <Card key={g.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center"><Gift className="w-5 h-5 text-secondary" /></div>
                      <div>
                        <p className="font-semibold text-foreground">{g.name}</p>
                        <p className="text-sm text-muted-foreground">From: {g.sender} · {g.date}</p>
                        {g.code && <p className="text-xs font-mono text-muted-foreground">Code: {g.code}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">${g.amount}</span>
                      <Badge variant={statusColor(g.status) as any}>{g.status}</Badge>
                      {g.status === "withdrawable" && <Button size="sm" variant="teal"><ArrowUpRight className="w-3 h-3 mr-1" />Withdraw</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CONTRIBUTIONS */}
          {section === "contributions" && (
            <div className="space-y-4">
              {contributions.map((c) => (
                <Card key={c.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-foreground">{c.campaign}</p>
                      <span className="text-sm text-muted-foreground">{c.contributors} contributors</span>
                    </div>
                    <Progress value={c.progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You contributed: <span className="text-primary font-semibold">${c.contributed}</span></span>
                      <span className="text-muted-foreground">{c.progress}% of ${c.goal}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CAMPAIGNS */}
          {section === "campaigns" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Your campaigns</p>
                <Link to="/create-campaign"><Button variant="hero" size="sm"><Plus className="w-4 h-4 mr-1" /> New Campaign</Button></Link>
              </div>
              {myCampaigns.map((c) => (
                <Link key={c.id} to={`/campaign/${c.slug}`}>
                  <Card className="border-border hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-foreground">{c.title}</p>
                        <Badge variant={statusColor(c.status) as any}>{c.status}</Badge>
                      </div>
                      <Progress value={(c.raised / c.goal) * 100} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">${c.raised} raised of ${c.goal}</span>
                        <span className="text-muted-foreground">{c.contributors} contributors</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              <Link to="/campaigns">
                <Button variant="outline" className="w-full mt-2">Browse All Public Campaigns <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </Link>
            </div>
          )}

          {/* WALLET */}
          {section === "wallet" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">${walletData.balance}</p><p className="text-xs text-muted-foreground">Available Balance</p></CardContent></Card>
                <Card className="border-border"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-accent">${walletData.pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
                <Card className="border-border"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-secondary">${walletData.totalWithdrawn}</p><p className="text-xs text-muted-foreground">Total Withdrawn</p></CardContent></Card>
              </div>
              <Button variant="hero"><ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw Funds</Button>
              <Card className="border-border">
                <CardHeader><CardTitle className="text-base font-body">Transaction History</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {walletData.transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.desc}</p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                      <span className={`font-semibold ${t.amount > 0 ? "text-secondary" : "text-destructive"}`}>{t.amount > 0 ? "+" : ""}${t.amount}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* SETTINGS */}
          {section === "settings" && (
            <div className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-semibold text-foreground">Account Settings</h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-border"><AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">D</AvatarFallback></Avatar>
                    <Button variant="outline" size="sm" className="gap-2"><Camera className="w-4 h-4" /> Change Photo</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label className="text-xs">Full Name</Label><Input defaultValue={user.name} /></div>
                    <div className="space-y-1"><Label className="text-xs">Username</Label><Input defaultValue={user.username} /></div>
                    <div className="space-y-1 sm:col-span-2"><Label className="text-xs">Email</Label><Input defaultValue={user.email} type="email" /></div>
                  </div>
                  <div className="border-t border-border pt-4 space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Social Links</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1"><Label className="text-xs">Twitter / X</Label><Input defaultValue="@destiny_dev" /></div>
                      <div className="space-y-1"><Label className="text-xs">Instagram</Label><Input defaultValue="@destiny.dev" /></div>
                      <div className="space-y-1 sm:col-span-2"><Label className="text-xs">Website</Label><Input defaultValue="https://destiny.dev" /></div>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4 space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payout Account</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {["Stripe", "Paystack", "Bank Transfer"].map((m) => (
                        <button key={m} className="p-3 rounded-xl border-2 border-border hover:border-primary/30 text-center transition-all">
                          <p className="text-sm font-medium text-foreground">{m}</p>
                          <p className="text-xs text-muted-foreground">Connect</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button variant="hero">Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CREATOR: MY GIFT PAGE */}
          {section === "gift-page" && creatorEnabled && (
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Your gift page is live! 🎉</p>
                    <p className="text-sm text-muted-foreground">gifttogether.com/{user.username}</p>
                  </div>
                  <Link to={`/u/${user.username}`}><Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" /> View Page</Button></Link>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-6 space-y-5">
                  <h3 className="font-semibold text-foreground">Gift Page Settings</h3>
                  <div className="space-y-2"><Label>Bio</Label><Textarea defaultValue="Frontend developer. Appreciate your support! 🚀" rows={3} /></div>
                  <div className="space-y-2"><Label>Suggested Amounts</Label><Input defaultValue="5, 10, 20" /><p className="text-xs text-muted-foreground">Comma-separated</p></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium text-foreground">Accept money gifts</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium text-foreground">Accept vendor gifts</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium text-foreground">Show supporters</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium text-foreground">Show amounts</p></div><Switch defaultChecked /></div>
                  <Button variant="hero">Save Settings</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CREATOR: SUPPORTERS */}
          {section === "supporters" && creatorEnabled && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{supporters.length} total supporters</p>
              {supporters.map((s) => (
                <Card key={s.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9"><AvatarFallback className="bg-muted text-xs">{s.name === "Anonymous" ? "?" : s.name.charAt(0)}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        {s.message && <p className="text-xs text-muted-foreground">"{s.message}"</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">${s.amount}</p>
                      <p className="text-xs text-muted-foreground">{s.date}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CREATOR: ANALYTICS */}
          {section === "analytics" && creatorEnabled && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Received", value: "$320" },
                  { label: "Supporters", value: "28" },
                  { label: "Page Views", value: "1.2k" },
                  { label: "Conversion", value: "4.2%" },
                ].map((s) => (
                  <Card key={s.label} className="border-border"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
                ))}
              </div>
              <Card className="border-border">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                  <p>Detailed analytics charts coming soon</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CREATOR: INTEGRATIONS */}
          {section === "integrations" && creatorEnabled && (
            <div className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Embed Gift Widget</h3>
                  <p className="text-sm text-muted-foreground">Add a gifting widget to your website</p>
                  <pre className="bg-muted rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto">{`<script src="https://cdn.gifttogether.com/widget.js"></script>\n<div id="gift-widget" data-user="${user.username}"></div>`}</pre>
                  <Button variant="outline" size="sm">Copy Code</Button>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">NPM Package</h3>
                  <pre className="bg-muted rounded-lg p-4 text-sm font-mono text-foreground">npm install @gifttogether/sdk</pre>
                </CardContent>
              </Card>
              <Link to="/developers"><Button variant="outline">View Full Developer Docs <ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
