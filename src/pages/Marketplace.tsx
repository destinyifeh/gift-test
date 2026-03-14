import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Search, ShoppingBag, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";

const gifts = [
  { id: "AX8H2K", name: "Cake Gift Card", emoji: "🎂", price: 25, vendor: "Sweet Delights", category: "food", type: "digital", rating: 4.8 },
  { id: "SP3M9N", name: "Spa Voucher", emoji: "💆", price: 50, vendor: "Relax Spa", category: "spa", type: "digital", rating: 4.9 },
  { id: "FS7K2L", name: "Fashion Store Gift Card", emoji: "👕", price: 75, vendor: "StyleHub", category: "fashion", type: "digital", rating: 4.7 },
  { id: "GM4R8T", name: "Gaming Store Credit", emoji: "🎮", price: 30, vendor: "GameVault", category: "birthday", type: "digital", rating: 4.6 },
  { id: "BK2N5P", name: "Book Store Voucher", emoji: "📚", price: 20, vendor: "PageTurner", category: "birthday", type: "digital", rating: 4.5 },
  { id: "FL9W3Q", name: "Flower Bouquet Delivery", emoji: "💐", price: 45, vendor: "BloomBox", category: "spa", type: "physical", rating: 4.8 },
  { id: "MU6Y1R", name: "Music Streaming Gift", emoji: "🎵", price: 15, vendor: "TuneWave", category: "birthday", type: "digital", rating: 4.4 },
  { id: "CF8T4S", name: "Coffee Subscription Box", emoji: "☕", price: 35, vendor: "BrewCraft", category: "food", type: "physical", rating: 4.7 },
];

const categories = ["all", "birthday", "spa", "fashion", "food"];
const priceRanges = ["all", "under-25", "25-50", "50-100", "over-100"];
const types = ["all", "digital", "physical"];

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [giftType, setGiftType] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

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
      <div className="pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
              Gift <span className="text-gradient">Shop</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse curated gifts from top vendors. Find the perfect gift for any occasion.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-3 sm:p-4 mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search gifts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Price" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-25">Under $25</SelectItem>
                  <SelectItem value="25-50">$25 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="over-100">Over $100</SelectItem>
                </SelectContent>
              </Select>
              <Select value={giftType} onValueChange={setGiftType}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filtered.map((gift, i) => (
              <motion.div key={gift.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="group hover:shadow-elevated transition-all duration-300 cursor-pointer border-border hover:border-primary/30 overflow-hidden relative">
                  <button
                    onClick={(e) => { e.preventDefault(); toggleFavorite(gift.id); }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(gift.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                  </button>
                  <Link to={`/gift-shop/${gift.id}`}>
                    <div className="h-28 sm:h-40 bg-muted flex items-center justify-center text-4xl sm:text-6xl group-hover:scale-110 transition-transform duration-300">
                      {gift.emoji}
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">{gift.category}</Badge>
                        <Badge variant="outline" className="text-xs hidden sm:inline-flex">{gift.type}</Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base line-clamp-1">{gift.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">{gift.vendor}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-base sm:text-lg font-bold text-primary">${gift.price}</span>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-accent">
                          <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-accent" />
                          {gift.rating}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
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
