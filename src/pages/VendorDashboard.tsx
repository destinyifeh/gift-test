import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Tag, ShoppingCart, DollarSign, CreditCard, Plus, MoreHorizontal, Wallet, ArrowUpRight, Clock, Building, Shield, Trash2, CheckCircle } from "lucide-react";
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

const vendorWallet = {
  available: 420,
  pending: 180,
  totalSales: 2340,
  transactions: [
    { id: 1, type: "sale", desc: "Spa Gift Card — John D.", amount: 50, date: "2026-03-08" },
    { id: 2, type: "sale", desc: "Deluxe Massage — Sarah M.", amount: 80, date: "2026-03-07" },
    { id: 3, type: "redeemed", desc: "SPA-9173 redeemed", amount: 0, date: "2026-03-07" },
    { id: 4, type: "withdrawal", desc: "Withdrawal to Bank", amount: -200, date: "2026-03-05" },
    { id: 5, type: "sale", desc: "Couples Package — Alex K.", amount: 120, date: "2026-03-06" },
  ],
};

const VendorDashboard = () => {
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showTransactions, setShowTransactions] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, bankName: "Business Bank", accountNumber: "••••••••5678", holderName: "Relax Spa Ltd.", country: "Nigeria", isPrimary: true }
  ]);
  const [bankForm, setBankForm] = useState({ country: "", bankName: "", accountNumber: "", holderName: "" });
  const [verifyAction, setVerifyAction] = useState<null | string>(null);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("");

  const handleAddBank = () => {
    if (!bankForm.country || !bankForm.bankName || !bankForm.accountNumber || !bankForm.holderName) return;
    setBankAccounts([...bankAccounts, {
      id: Date.now(), bankName: bankForm.bankName,
      accountNumber: "••••••••" + bankForm.accountNumber.slice(-4),
      holderName: bankForm.holderName, country: bankForm.country,
      isPrimary: bankAccounts.length === 0
    }]);
    setBankForm({ country: "", bankName: "", accountNumber: "", holderName: "" });
    setShowBankForm(false);
    setVerifyAction(null);
  };

  const confirmVerifiedAction = () => {
    if (!verifyPassword) return;
    if (verifyAction?.startsWith("remove-bank-")) {
      const id = Number(verifyAction.split("-")[2]);
      setBankAccounts(bankAccounts.filter(b => b.id !== id));
    }
    if (verifyAction === "withdraw") {
      setShowWithdrawForm(false);
      setWithdrawAmount("");
    }
    if (verifyAction === "add-bank") {
      handleAddBank();
    }
    setVerifyAction(null);
    setVerifyPassword("");
  };

  const renderVerifyModal = () => {
    if (!verifyAction) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-foreground/50" onClick={() => { setVerifyAction(null); setVerifyPassword(""); }} />
        <Card className="relative z-10 w-full max-w-sm mx-4 border-border shadow-elevated">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">Security Verification</h3>
              <p className="text-sm text-muted-foreground mt-1">Enter your password to confirm this action</p>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="Enter your password" value={verifyPassword} onChange={e => setVerifyPassword(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground text-center">Or we can send a verification code to your email</p>
            <div className="flex gap-3">
              <Button variant="hero" className="flex-1" onClick={confirmVerifiedAction} disabled={!verifyPassword}>Confirm</Button>
              <Button variant="outline" className="flex-1" onClick={() => { setVerifyAction(null); setVerifyPassword(""); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {renderVerifyModal()}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">Vendor Dashboard</h1>
              <p className="text-muted-foreground">Manage your products, codes, and payouts</p>
            </div>
            <Button variant="hero"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
          </div>

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
            <TabsList className="grid w-full grid-cols-5 max-w-xl">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="codes">Codes</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
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

            {/* Vendor Wallet */}
            <TabsContent value="wallet" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border">
                  <CardContent className="p-5 text-center">
                    <Wallet className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-3xl font-bold text-foreground">${vendorWallet.available}</p>
                    <p className="text-xs text-muted-foreground mt-1">Available Balance</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-5 text-center">
                    <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="text-3xl font-bold text-foreground">${vendorWallet.pending}</p>
                    <p className="text-xs text-muted-foreground mt-1">Pending Balance</p>
                    <p className="text-xs text-muted-foreground">(purchased but not redeemed)</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-5 text-center">
                    <DollarSign className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <p className="text-3xl font-bold text-foreground">${vendorWallet.totalSales.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Sales</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="hero" onClick={() => setShowWithdrawForm(!showWithdrawForm)}>
                  <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw Funds
                </Button>
                <Button variant="outline" onClick={() => setShowTransactions(!showTransactions)}>
                  <Clock className="w-4 h-4 mr-2" /> View Transactions
                </Button>
                <Button variant="outline" onClick={() => setShowBankForm(!showBankForm)}>
                  <Building className="w-4 h-4 mr-2" /> {bankAccounts.length > 0 ? "Manage Bank Accounts" : "Connect Bank Account"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">You can only withdraw from your Available Balance (${vendorWallet.available}), not Pending Balance.</p>

              {/* Bank Account Management */}
              {showBankForm && (
                <Card className="border-border">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-foreground">Bank Accounts</h3>
                    {bankAccounts.map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">{b.bankName} {b.isPrimary && <Badge variant="secondary" className="ml-2 text-xs">Primary</Badge>}</p>
                          <p className="text-xs text-muted-foreground">{b.holderName} · {b.accountNumber} · {b.country}</p>
                        </div>
                        <div className="flex gap-2">
                          {!b.isPrimary && (
                            <Button variant="ghost" size="sm" onClick={() => {
                              setBankAccounts(bankAccounts.map(ba => ({ ...ba, isPrimary: ba.id === b.id })));
                            }}>Set Primary</Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setVerifyAction(`remove-bank-${b.id}`)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Add New Bank Account</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Country</Label>
                          <Select value={bankForm.country} onValueChange={v => setBankForm({ ...bankForm, country: v })}>
                            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nigeria">Nigeria</SelectItem>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Ghana">Ghana</SelectItem>
                              <SelectItem value="Kenya">Kenya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Bank Name</Label>
                          <Input value={bankForm.bankName} onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })} placeholder="e.g. First Bank" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Account Number</Label>
                          <Input value={bankForm.accountNumber} onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })} placeholder="e.g. 0123456789" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Account Holder Name</Label>
                          <Input value={bankForm.holderName} onChange={e => setBankForm({ ...bankForm, holderName: e.target.value })} placeholder="Full name" />
                        </div>
                      </div>
                      <Button variant="hero" size="sm" onClick={() => setVerifyAction("add-bank")}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Verify & Add Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Withdrawal Form */}
              {showWithdrawForm && (
                <Card className="border-primary/20">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-foreground">Withdraw Funds</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Select Bank Account</Label>
                        <Select value={withdrawBank} onValueChange={setWithdrawBank}>
                          <SelectTrigger><SelectValue placeholder="Choose bank" /></SelectTrigger>
                          <SelectContent>
                            {bankAccounts.map(b => (
                              <SelectItem key={b.id} value={String(b.id)}>{b.bankName} — {b.accountNumber}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input type="number" placeholder="$0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} max={vendorWallet.available} />
                        <p className="text-xs text-muted-foreground">Max: ${vendorWallet.available}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="hero" onClick={() => setVerifyAction("withdraw")} disabled={!withdrawBank || !withdrawAmount}>
                        <Shield className="w-4 h-4 mr-1" /> Verify & Withdraw
                      </Button>
                      <Button variant="outline" onClick={() => setShowWithdrawForm(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction History */}
              {showTransactions && (
                <Card className="border-border">
                  <CardHeader><CardTitle className="text-base font-body">Transaction History</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="text-left py-2 font-medium">Date</th>
                            <th className="text-left py-2 font-medium">Description</th>
                            <th className="text-left py-2 font-medium">Type</th>
                            <th className="text-right py-2 font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendorWallet.transactions.map((t) => (
                            <tr key={t.id} className="border-b border-border last:border-0">
                              <td className="py-3 text-foreground">{t.date}</td>
                              <td className="py-3 text-foreground">{t.desc}</td>
                              <td className="py-3"><Badge variant="outline" className="text-xs">{t.type}</Badge></td>
                              <td className={`py-3 text-right font-semibold ${t.amount > 0 ? "text-secondary" : t.amount < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {t.amount > 0 ? `+$${t.amount}` : t.amount < 0 ? `-$${Math.abs(t.amount)}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
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
