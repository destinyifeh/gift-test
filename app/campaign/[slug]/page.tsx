'use client';

import Navbar from '@/components/landing/Navbar';
import SendGiftModal from '@/components/SendGiftModal';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Progress} from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  Gift,
  Globe,
  Heart,
  Lock,
  Share2,
  Users,
} from 'lucide-react';
import {use, useState} from 'react';

const campaignData = {
  title: 'Birthday Gift for Sarah 🎂',
  description:
    "Let's surprise Sarah with an amazing birthday gift! She's turning 30 and deserves something special. Pool your contributions and we'll get her the perfect present.",
  creator: 'John D.',
  category: 'personal',
  goal: 500,
  raised: 340,
  contributors: 12,
  endDate: '2026-03-17',
  visibility: 'public' as const,
  image: '/default-campaign.png',
  contributions: [
    {
      id: 1,
      name: 'Mary K.',
      amount: 50,
      message: 'Happy birthday Sarah! 🎉',
      anonymous: false,
      hideAmount: false,
      date: '2026-03-08',
    },
    {
      id: 2,
      name: 'Anonymous',
      amount: 25,
      message: 'Wishing you the best!',
      anonymous: true,
      hideAmount: false,
      date: '2026-03-07',
    },
    {
      id: 3,
      name: 'Tom R.',
      amount: null,
      message: "Can't wait for the party!",
      anonymous: false,
      hideAmount: true,
      date: '2026-03-07',
    },
    {
      id: 4,
      name: 'Lisa M.',
      amount: 100,
      message: '',
      anonymous: false,
      hideAmount: false,
      date: '2026-03-06',
    },
    {
      id: 5,
      name: 'Anonymous',
      amount: null,
      message: 'Love you Sarah!',
      anonymous: true,
      hideAmount: true,
      date: '2026-03-05',
    },
  ],
};

export default function CampaignPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = use(params);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const progress = (campaignData.raised / campaignData.goal) * 100;

  const getDaysLeft = () => {
    const end = new Date(campaignData.endDate);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-3">
              <div className="rounded-2xl overflow-hidden bg-muted aspect-video mb-6 flex items-center justify-center relative border border-border">
                {campaignData.image &&
                campaignData.image !== '/default-campaign.png' ? (
                  <img
                    src={campaignData.image}
                    alt={campaignData.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground bg-muted/50 w-full h-full">
                    <Gift className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm font-medium opacity-50">
                      Campaign Image
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{campaignData.category}</Badge>
                <Badge variant="outline" className="gap-1">
                  {campaignData.visibility === 'public' ? (
                    <Globe className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {campaignData.visibility}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold font-display text-foreground mb-3">
                {campaignData.title}
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {campaignData.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>
                  Created by{' '}
                  <span className="text-foreground font-medium">
                    {campaignData.creator}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Ends on{' '}
                  {campaignData.endDate}
                </span>
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-2 space-y-4">
              <Card className="border-border shadow-elevated">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-foreground">
                      ${campaignData.raised}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      raised of ${campaignData.goal} goal
                    </p>
                  </div>
                  <Progress value={progress} className="h-3 mb-4" />
                  <div className="flex justify-between text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {campaignData.contributors}{' '}
                      contributors
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {getDaysLeft()} days left
                    </span>
                  </div>
                  <Button
                    variant="hero"
                    className="w-full h-12 text-base mb-3"
                    onClick={() => setShowGiftModal(true)}>
                    <Gift className="w-5 h-5 mr-2" /> Send a Gift
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Share2 className="w-4 h-4" /> Share Campaign
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" /> Recent
                    Contributions
                  </h3>
                  <div className="space-y-3">
                    {campaignData.contributions.map(c => (
                      <div key={c.id} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-muted text-xs">
                            {c.anonymous ? '?' : c.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">
                              {c.name}
                            </p>
                            {!c.hideAmount && c.amount && (
                              <span className="text-sm font-semibold text-primary">
                                ${c.amount}
                              </span>
                            )}
                            {c.hideAmount && (
                              <span className="text-xs text-muted-foreground italic">
                                hidden
                              </span>
                            )}
                          </div>
                          {c.message && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              "{c.message}"
                            </p>
                          )}
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

      <SendGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        campaignTitle={campaignData.title}
        hideRecipientFields={true}
      />
    </div>
  );
}
