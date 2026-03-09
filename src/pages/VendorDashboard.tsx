import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Tag, ShoppingCart, DollarSign, CreditCard, Plus, Eye, MoreHorizontal } from "lucide-react";
import Navbar from "@/components/landing/Navbar";

const products = [
  { id: 1, name: "Spa Gift Card", price: 50, sold: 142, status: "active" },
  { id: 2, name: "Deluxe Massage Voucher", price: 80, sold: 89, status: "active" },
  { id: 3, name: "Couples Package", price: 120, sold: 34, status: "draft" },
];

const redeemCodes = [
  { code: "SPA-4821", product: "Spa Gift Card", status: "active", buyer: "John D." },
  { code: "SPA-9173", product: "Deluxe Massage", status: "redeemed", buyer: "Sarah M." },
  { code: "SPA-2634", product: "Spa Gift Card", status: "expired", buyer: "Mike R." },
];

const orders = [
  { id: "#ORD-001", product: "Spa Gift Card", buyer: "John D.", amount: 50, date: "2026-03-08", status: "completed" },
  { id: "#ORD-002", product: "Deluxe Massage", buyer: "Sarah M.", amount: 80, date: "2026-03-07", status: "completed" },
  { id: "#ORD-003", product: "Couples Package", buyer: "Alex K.", amount: 120, date: "2026-03-06", status: "pending" },
];

const VendorDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">Vendor Dashboard</h1>
              <p className="text-muted-foreground">Manage your products, codes, and payouts</p>
            </div>
            <Button variant="hero"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Products", value: "3", icon: Package },
              { label: "Total Orders", value: "265", icon: ShoppingCart },
              { label: "Revenue", value: "$12,450", icon: DollarSign },
              { label: "Pending Payout", value: "$2,340", icon: CreditCard },
            ].map((s) => (
              <Card key={s.label} className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
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

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-lg">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="codes">Codes</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              {products.map((p) => (
                <Card key={p.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground" /></div>
                      <div>
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-sm text-muted-foreground">${p.price} · {p.sold} sold</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={p.status === "active" ? "secondary" : "outline"}>{p.status}</Badge>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="codes" className="space-y-4">
              <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm"><Tag className="w-4 h-4 mr-2" /> Generate Codes</Button>
              </div>
              {redeemCodes.map((c) => (
                <Card key={c.code} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-mono font-semibold text-foreground">{c.code}</p>
                      <p className="text-sm text-muted-foreground">{c.product} · Buyer: {c.buyer}</p>
                    </div>
                    <Badge variant={c.status === "active" ? "secondary" : c.status === "redeemed" ? "default" : "outline"}>{c.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              {orders.map((o) => (
                <Card key={o.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{o.id} — {o.product}</p>
                      <p className="text-sm text-muted-foreground">Buyer: {o.buyer} · {o.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">${o.amount}</span>
                      <Badge variant={o.status === "completed" ? "secondary" : "outline"}>{o.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="payouts">
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Pending Payout: $2,340</h3>
                  <p className="text-muted-foreground mb-6">Your next payout is scheduled for March 15, 2026</p>
                  <Button variant="teal" size="lg">Request Payout</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
