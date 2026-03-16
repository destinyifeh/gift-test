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
    theme?: {
      primary: string;
      background: string;
      text: string;
    };
    banner?: string;
    removeBranding?: boolean;
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
    plan: 'pro',
    theme: {
      primary: 'hsl(16 85% 60%)',
      background: 'hsl(30 50% 98%)',
      text: 'hsl(20 25% 12%)',
    },
    banner:
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    removeBranding: true,
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

  const customStyles =
    profile.plan === 'pro' && profile.theme
      ? ({
          '--creator-primary': profile.theme.primary,
          '--creator-bg': profile.theme.background,
          '--creator-text': profile.theme.text,
        } as React.CSSProperties)
      : {};

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor:
          profile.plan === 'pro' && profile.theme
            ? profile.theme.background
            : 'var(--background)',
        color:
          profile.plan === 'pro' && profile.theme
            ? profile.theme.text
            : 'var(--foreground)',
        ...customStyles,
      }}>
      <Navbar />

      {profile.plan === 'pro' && profile.banner && (
        <div className="h-48 sm:h-64 w-full overflow-hidden relative pt-16">
          <img
            src={profile.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        </div>
      )}

      <div
        className={
          profile.banner ? 'pb-16 -mt-12 relative z-10' : 'pt-20 pb-16'
        }>
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-background shadow-lg">
              <AvatarFallback
                className="text-2xl font-bold"
                style={{
                  backgroundColor:
                    profile.plan === 'pro' && profile.theme
                      ? profile.theme.primary
                      : 'var(--primary)',
                  color: 'white',
                }}>
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold font-display">{profile.name}</h1>
            <p className="opacity-70 mt-1">@{username}</p>
            <p className="mt-3 max-w-md mx-auto">{profile.bio}</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm opacity-70">
              <span className="flex items-center gap-1">
                <Heart
                  className="w-4 h-4"
                  style={{
                    color:
                      profile.plan === 'pro' && profile.theme
                        ? profile.theme.primary
                        : 'var(--primary)',
                  }}
                />{' '}
                {profile.totalSupporters} supporters
              </span>
              <span className="flex items-center gap-1">
                <Gift className="w-4 h-4 text-secondary" /> $
                {profile.totalReceived} received
              </span>
            </div>
          </div>

          <Card
            className="border-border shadow-elevated mb-6"
            style={{
              backgroundColor:
                profile.plan === 'pro' && profile.theme
                  ? 'white'
                  : 'var(--card)',
              color: 'var(--foreground)',
            }}>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-1 text-center text-foreground">
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
                    className="h-14 text-lg font-bold border-2 hover:border-creator-primary transition-colors"
                    style={
                      {
                        '--creator-primary':
                          profile.plan === 'pro' && profile.theme
                            ? profile.theme.primary
                            : 'var(--primary)',
                      } as React.CSSProperties
                    }
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
                      className="p-3 rounded-xl border border-border hover:border-primary/30 transition-all text-center bg-card">
                      <p className="text-sm font-medium text-foreground">
                        {g.name}
                      </p>
                      <p
                        className="text-xs font-semibold mt-1"
                        style={{
                          color:
                            profile.plan === 'pro' && profile.theme
                              ? profile.theme.primary
                              : 'var(--primary)',
                        }}>
                        ${g.price}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <Button
                variant="hero"
                className="w-full h-12 mt-4"
                style={
                  profile.plan === 'pro' && profile.theme
                    ? {
                        backgroundColor: profile.theme.primary,
                        backgroundImage: 'none',
                      }
                    : {}
                }
                onClick={() => setShowGiftModal(true)}>
                <Gift className="w-5 h-5 mr-2" /> Send Gift
              </Button>
            </CardContent>
          </Card>

          {profile.showSupporters && (
            <Card
              className="border-border"
              style={{
                backgroundColor:
                  profile.plan === 'pro' && profile.theme
                    ? 'white'
                    : 'var(--card)',
                color: 'var(--foreground)',
              }}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Heart
                    className="w-4 h-4"
                    style={{
                      color:
                        profile.plan === 'pro' && profile.theme
                          ? profile.theme.primary
                          : 'var(--primary)',
                    }}
                  />{' '}
                  Supporters
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
                          <p className="text-sm font-medium">{s.name}</p>
                          <span
                            className="text-sm font-semibold"
                            style={{
                              color:
                                profile.plan === 'pro' && profile.theme
                                  ? profile.theme.primary
                                  : 'var(--primary)',
                            }}>
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

          {/* Powered by branding - hidden if pro and removeBranding is true */}
          {(!profile.removeBranding || profile.plan === 'free') && (
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
        hideRecipientFields={true}
      />
    </div>
  );
}
