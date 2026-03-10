import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Gift, Share2, Heart, Users, Clock, Lock, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import SendGiftModal from "@/components/SendGiftModal";

const campaignData = {
  title: "Birthday Gift for Sarah 🎂",
  description: "Let's surprise Sarah with an amazing birthday gift! She's turning 30 and deserves something special. Pool your contributions and we'll get her the perfect present.",
  creator: "John D.",
  category: "personal",
  goal: 500,
  raised: 340,
  contributors: 12,
  daysLeft: 5,
  visibility: "public" as const,
  image: "/placeholder.svg",
  contributions: [
    { id: 1, name: "Mary K.", amount: 50, message: "Happy birthday Sarah! 🎉", anonymous: false, hideAmount: false, date: "2026-03-08" },
    { id: 2, name: "Anonymous", amount: 25, message: "Wishing you the best!", anonymous: true, hideAmount: false, date: "2026-03-07" },
    { id: 3, name: "Tom R.", amount: null, message: "Can't wait for the party!", anonymous: false, hideAmount: true, date: "2026-03-07" },
    { id: 4, name: "Lisa M.", amount: 100, message: "", anonymous: false, hideAmount: false, date: "2026-03-06" },
    { id: 5, name: "Anonymous", amount: null, message: "Love you Sarah!", anonymous: true, hideAmount: true, date: "2026-03-05" },
  ],
};

const CampaignPage = () => {
  const [showGiftModal, setShowGiftModal] = useState(false);
  const progress = (campaignData.raised / campaignData.goal) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Campaign Header */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-3">
              <div className="rounded-2xl overflow-hidden bg-muted aspect-video mb-6">
                <img src={campaignData.image} alt={campaignData.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{campaignData.category}</Badge>
                <Badge variant="outline" className="gap-1">
                  {campaignData.visibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {campaignData.visibility}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold font-display text-foreground mb-3">{campaignData.title}</h1>
              <p className="text-muted-foreground leading-relaxed mb-4">{campaignData.description}</p>
              <p className="text-sm text-muted-foreground">Created by <span className="text-foreground font-medium">{campaignData.creator}</span></p>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-2 space-y-4">
              <Card className="border-border shadow-elevated">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-foreground">${campaignData.raised}</p>
                    <p className="text-sm text-muted-foreground">raised of ${campaignData.goal} goal</p>
                  </div>
                  <Progress value={progress} className="h-3 mb-4" />
                  <div className="flex justify-between text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {campaignData.contributors} contributors</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {campaignData.daysLeft} days left</span>
                  </div>
                  <Button variant="hero" className="w-full h-12 text-base mb-3" onClick={() => setShowGiftModal(true)}>
                    <Gift className="w-5 h-5 mr-2" /> Send a Gift
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Share2 className="w-4 h-4" /> Share Campaign
                  </Button>
                </CardContent>
              </Card>

              {/* Recent contributions */}
              <Card className="border-border">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-primary" /> Recent Contributions</h3>
                  <div className="space-y-3">
                    {campaignData.contributions.map((c) => (
                      <div key={c.id} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-muted text-xs">{c.anonymous ? "?" : c.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">{c.name}</p>
                            {!c.hideAmount && c.amount && <span className="text-sm font-semibold text-primary">${c.amount}</span>}
                            {c.hideAmount && <span className="text-xs text-muted-foreground italic">hidden</span>}
                          </div>
                          {c.message && <p className="text-xs text-muted-foreground mt-0.5 truncate">"{c.message}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <SendGiftModal open={showGiftModal} onOpenChange={setShowGiftModal} campaignTitle={campaignData.title} />
    </div>
  );
};

export default CampaignPage;
