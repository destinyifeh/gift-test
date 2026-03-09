import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Search, ShoppingBag, Star, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";

const gifts = [
  { id: "AX8H2K", name: "Cake Gift Card", emoji: "🎂", price: 25, vendor: "Sweet Delights", category: "food", type: "digital", rating: 4.8, image: "🎂" },
  { id: "SP3M9N", name: "Spa Voucher", emoji: "💆", price: 50, vendor: "Relax Spa", category: "spa", type: "digital", rating: 4.9, image: "💆" },
  { id: "FS7K2L", name: "Fashion Store Gift Card", emoji: "👕", price: 75, vendor: "StyleHub", category: "fashion", type: "digital", rating: 4.7, image: "👕" },
  { id: "GM4R8T", name: "Gaming Store Credit", emoji: "🎮", price: 30, vendor: "GameVault", category: "birthday", type: "digital", rating: 4.6, image: "🎮" },
  { id: "BK2N5P", name: "Book Store Voucher", emoji: "📚", price: 20, vendor: "PageTurner", category: "birthday", type: "digital", rating: 4.5, image: "📚" },
  { id: "FL9W3Q", name: "Flower Bouquet Delivery", emoji: "💐", price: 45, vendor: "BloomBox", category: "spa", type: "physical", rating: 4.8, image: "💐" },
  { id: "MU6Y1R", name: "Music Streaming Gift", emoji: "🎵", price: 15, vendor: "TuneWave", category: "birthday", type: "digital", rating: 4.4, image: "🎵" },
  { id: "CF8T4S", name: "Coffee Subscription Box", emoji: "☕", price: 35, vendor: "BrewCraft", category: "food", type: "physical", rating: 4.7, image: "☕" },
];

const categories = ["all", "birthday", "spa", "fashion", "food"];
const priceRanges = ["all", "under-25", "25-50", "50-100", "over-100"];
const types = ["all", "digital", "physical"];

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [giftType, setGiftType] = useState("all");

  const filtered = gifts.filter((g) => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "all" && g.category !== category) return false;
    if (giftType !== "all" && g.type !== giftType) return false;
    if (priceRange === "under-25" && g.price >= 25) return false;
    if (priceRange === "25-50" && (g.price < 25 || g.price > 50)) return false;
    if (priceRange === "50-100" && (g.price < 50 || g.price > 100)) return false;
    if (priceRange === "over-100" && g.price <= 100) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
              Gift <span className="text-gradient">Marketplace</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse curated gifts from top vendors. Find the perfect gift for any occasion.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-4 mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search gifts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Price" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-25">Under $25</SelectItem>
                <SelectItem value="25-50">$25 - $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="over-100">Over $100</SelectItem>
              </SelectContent>
            </Select>
            <Select value={giftType} onValueChange={setGiftType}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((gift, i) => (
              <motion.div key={gift.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/marketplace/${gift.id}`}>
                  <Card className="group hover:shadow-elevated transition-all duration-300 cursor-pointer border-border hover:border-primary/30 overflow-hidden">
                    <div className="h-40 bg-muted flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                      {gift.emoji}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">{gift.category}</Badge>
                        <Badge variant="outline" className="text-xs">{gift.type}</Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{gift.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{gift.vendor}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${gift.price}</span>
                        <div className="flex items-center gap-1 text-sm text-accent">
                          <Star className="w-3.5 h-3.5 fill-accent" />
                          {gift.rating}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No gifts found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Marketplace;
