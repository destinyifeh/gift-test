import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Gift, Send, Clock, DollarSign, Users, ArrowUpRight, Download, Eye, Plus } from "lucide-react";
import { Link } from "react-router-dom";
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

const statusColor = (s: string) => {
  if (s === "delivered" || s === "claimed") return "secondary";
  if (s === "pending" || s === "unclaimed") return "outline";
  return "default";
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">My Dashboard</h1>
              <p className="text-muted-foreground">Manage your gifts, contributions, and more</p>
            </div>
            <Link to="/create-campaign">
              <Button variant="hero"><Plus className="w-4 h-4 mr-2" /> New Campaign</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

          <Tabs defaultValue="sent" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="contributions">Contributions</TabsTrigger>
            </TabsList>

            <TabsContent value="sent" className="space-y-4">
              {sentGifts.map((g) => (
                <Card key={g.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Send className="w-5 h-5 text-primary" />
                      </div>
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
            </TabsContent>

            <TabsContent value="received" className="space-y-4">
              {receivedGifts.map((g) => (
                <Card key={g.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-secondary" />
                      </div>
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
            </TabsContent>

            <TabsContent value="contributions" className="space-y-4">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
