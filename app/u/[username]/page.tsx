'use client';

import Navbar from '@/components/landing/Navbar';
import SendGiftModal from '@/components/SendGiftModal';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Gift, Heart, Share2} from 'lucide-react';
import Link from 'next/link';
import {use, useState} from 'react';

const enabledUsers: Record<
  string,
  {
    name: string;
    bio: string;
    suggestedAmounts: number[];
    showSupporters: boolean;
    plan: 'free' | 'pro';
    supporters: {
      id: number;
      name: string;
      amount: number;
      message: string;
      anonymous: boolean;
      date: string;
    }[];
    vendorGifts: {id: number; name: string; price: number}[];
    totalReceived: number;
    totalSupporters: number;
  }
> = {
  destiny: {
    name: 'Destiny O.',
    bio: 'Frontend developer. Appreciate your support! 🚀',
    suggestedAmounts: [5, 10, 25],
    showSupporters: true,
    plan: 'free',
    supporters: [
      {
        id: 1,
        name: 'John',
        amount: 10,
        message: 'Great work!',
        anonymous: false,
        date: '2026-03-08',
      },
      {
        id: 2,
        name: 'Mary',
        amount: 25,
        message: 'Keep building!',
        anonymous: false,
        date: '2026-03-07',
      },
      {
        id: 3,
        name: 'Anonymous',
        amount: 5,
        message: '',
        anonymous: true,
        date: '2026-03-06',
      },
      {
        id: 4,
        name: 'Sarah',
        amount: 50,
        message: 'Love your content 🎉',
        anonymous: false,
        date: '2026-03-05',
      },
    ],
    vendorGifts: [
      {id: 1, name: '☕ Coffee Gift Card', price: 10},
      {id: 2, name: '🎂 Cake Gift Card', price: 25},
      {id: 3, name: '💆 Spa Voucher', price: 50},
    ],
    totalReceived: 320,
    totalSupporters: 28,
  },
};

export default function CreatorProfilePage({
  params,
}: {
  params: Promise<{username: string}>;
}) {
  const {username} = use(params);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const profile = username ? enabledUsers[username] : null;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center px-4">
          <Card className="max-w-md w-full border-border shadow-elevated">
            <CardContent className="p-8 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-muted">
                <AvatarFallback className="bg-muted text-muted-foreground text-2xl font-bold">
                  {username?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-bold font-display text-foreground mb-2">
                @{username}
              </h1>
              <p className="text-muted-foreground mb-6">
                This user has not enabled gifts yet.
              </p>
              <Badge variant="outline" className="text-sm">
                Gift page inactive
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold font-display text-foreground">
              {profile.name}
            </h1>
            <p className="text-muted-foreground mt-1">@{username}</p>
            <p className="text-foreground mt-3 max-w-md mx-auto">
              {profile.bio}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-primary" />{' '}
                {profile.totalSupporters} supporters
              </span>
              <span className="flex items-center gap-1">
                <Gift className="w-4 h-4 text-secondary" /> $
                {profile.totalReceived} received
              </span>
            </div>
          </div>

          <Card className="border-border shadow-elevated mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-foreground mb-1 text-center">
                Support or send a gift 🎁
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Choose an amount or send a vendor gift
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {profile.suggestedAmounts.map(a => (
                  <Button
                    key={a}
                    variant="outline"
                    className="h-14 text-lg font-bold"
                    onClick={() => setShowGiftModal(true)}>
                    ${a}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={() => setShowGiftModal(true)}>
                Custom amount
              </Button>
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  Or send a gift
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {profile.vendorGifts.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setShowGiftModal(true)}
                      className="p-3 rounded-xl border border-border hover:border-primary/30 transition-all text-center">
                      <p className="text-sm font-medium text-foreground">
                        {g.name}
                      </p>
                      <p className="text-xs text-primary font-semibold mt-1">
                        ${g.price}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <Button
                variant="hero"
                className="w-full h-12 mt-4"
                onClick={() => setShowGiftModal(true)}>
                <Gift className="w-5 h-5 mr-2" /> Send Gift
              </Button>
            </CardContent>
          </Card>

          {profile.showSupporters && (
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" /> Supporters
                </h3>
                <div className="space-y-4">
                  {profile.supporters.map(s => (
                    <div key={s.id} className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted text-xs">
                          {s.anonymous ? '?' : s.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">
                            {s.name}
                          </p>
                          <span className="text-sm font-semibold text-primary">
                            ${s.amount}
                          </span>
                        </div>
                        {s.message && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            "{s.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-6">
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" /> Share this page
            </Button>
          </div>

          {/* Powered by branding for free plan */}
          {profile.plan === 'free' && (
            <div className="text-center mt-8 pb-4">
              <p className="text-xs text-muted-foreground">
                Powered by{' '}
                <Link
                  href="/"
                  className="font-semibold text-primary hover:underline">
                  Gifthance
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
      <SendGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        recipientName={profile.name}
      />
    </div>
  );
}
