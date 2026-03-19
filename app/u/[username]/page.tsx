'use client';

import GiftSelection from '@/components/GiftSelection';
import Navbar from '@/components/landing/Navbar';
import SendCreatorGiftModal from '@/components/SendCreatorGiftModal';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {useProfileByUsername} from '@/hooks/use-profile';
import {useUserStore} from '@/lib/store/useUserStore';
import {
  ArrowLeft,
  Gift,
  Globe,
  Heart,
  Instagram,
  Share2,
  Sparkles,
  Twitter,
} from 'lucide-react';
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
  const [selectedMethod, setSelectedMethod] = useState<
    'money' | 'vendor' | null
  >(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedVendorGift, setSelectedVendorGift] = useState<number | null>(
    null,
  );
  const [showAllSupporters, setShowAllSupporters] = useState(false);

  const loggedInUser = useUserStore(state => state.user);
  const {data: dbProfile, isLoading} = useProfileByUsername(username);

  // Merge DB data with mock data if it exists for backward compatibility during dev
  const mockData = username ? enabledUsers[username] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOwner =
    loggedInUser?.username?.toLowerCase() === username?.toLowerCase();

  // Profile is valid if it exists in DB and is_creator is true
  const isCreatorEnabled = dbProfile?.is_creator || mockData !== null;

  if (!dbProfile || !isCreatorEnabled) {
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

  const plan =
    (dbProfile ? dbProfile.theme_settings?.plan : mockData?.plan) || 'free';

  const profile = {
    name: dbProfile?.display_name || mockData?.name || username || 'User',
    bio: dbProfile?.bio || mockData?.bio || 'No bio yet.',
    suggestedAmounts: dbProfile?.suggested_amounts ||
      mockData?.suggestedAmounts || [5, 10, 25],
    showSupporters:
      dbProfile?.theme_settings?.showSupporters ??
      mockData?.showSupporters ??
      true,
    showAmounts: dbProfile?.theme_settings?.showAmounts ?? true,
    acceptMoney: dbProfile?.theme_settings?.acceptMoney ?? true,
    acceptVendor: dbProfile?.theme_settings?.acceptVendor ?? true,
    plan,
    theme_settings: dbProfile?.theme_settings || {},
    banner:
      plan === 'pro' && dbProfile?.theme_settings?.proBanner
        ? dbProfile?.theme_settings?.proBanner
        : undefined,
    removeBranding:
      plan === 'pro'
        ? (dbProfile?.theme_settings?.proRemoveBranding ?? false)
        : false,
    supporters: mockData?.supporters || enabledUsers.destiny.supporters,
    totalReceived:
      mockData?.totalReceived || enabledUsers.destiny.totalReceived,
    totalSupporters:
      mockData?.totalSupporters || enabledUsers.destiny.totalSupporters,
    socialLinks: dbProfile?.social_links || {},
    vendorGifts: mockData?.vendorGifts || [
      {id: 1, name: '☕ Coffee Gift Card', price: 10},
      {id: 2, name: '🎂 Cake Gift Card', price: 25},
      {id: 3, name: '💆 Spa Voucher', price: 50},
    ],
  };

  const customStyles =
    profile.plan === 'pro' && profile.theme_settings
      ? ({
          '--creator-primary': profile.theme_settings.primaryColor,
          '--creator-bg': profile.theme_settings.bgColor,
          '--creator-text': profile.theme_settings.textColor,
        } as React.CSSProperties)
      : {};

  return (
    <div
      className={`min-h-screen ${
        profile.plan === 'pro' && profile.theme_settings?.proTheme
          ? `${profile.theme_settings.proTheme}-theme`
          : ''
      }`}
      style={{
        backgroundColor:
          profile.plan === 'pro' && profile.theme_settings?.bgColor
            ? profile.theme_settings.bgColor
            : 'var(--background)',
        color:
          profile.plan === 'pro' && profile.theme_settings?.textColor
            ? profile.theme_settings.textColor
            : 'var(--foreground)',
        ...customStyles,
      }}>
      <Navbar />

      {isOwner && (
        <div className="fixed top-20 left-4 z-50">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground sm:gap-2 gap-0 bg-background/50 backdrop-blur-sm border border-border/50 rounded-full sm:px-4 px-2.5 h-10 w-10 sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">
                Back to Dashboard
              </span>
            </Button>
          </Link>
        </div>
      )}

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
                className="text-2xl font-bold capitalize bg-primary text-primary-foreground"
                style={
                  profile.plan === 'pro' && profile.theme_settings?.primaryColor
                    ? {
                        backgroundColor: profile.theme_settings.primaryColor,
                        color: 'white',
                      }
                    : {}
                }>
                {profile.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold font-display">{profile.name}</h1>
            <p className="opacity-70 mt-1">@{username}</p>
            <p className="mt-3 max-w-md mx-auto">{profile.bio}</p>

            <div className="flex items-center justify-center gap-3 mt-4">
              {profile.socialLinks.twitter && (
                <a
                  href={`https://x.com/${profile.socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted">
                    <Twitter className="w-4 h-4" />
                  </Button>
                </a>
              )}
              {profile.socialLinks.instagram && (
                <a
                  href={`https://instagram.com/${profile.socialLinks.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted">
                    <Instagram className="w-4 h-4" />
                  </Button>
                </a>
              )}
              {profile.socialLinks.website && (
                <a
                  href={
                    profile.socialLinks.website.startsWith('http')
                      ? profile.socialLinks.website
                      : `https://${profile.socialLinks.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted">
                    <Globe className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm opacity-70">
              <span className="flex items-center gap-1">
                <Heart
                  className="w-4 h-4"
                  style={{
                    color:
                      profile.plan === 'pro' &&
                      profile.theme_settings?.primaryColor
                        ? profile.theme_settings.primaryColor
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
            className="border-border shadow-elevated mb-6 overflow-hidden"
            style={{
              backgroundColor:
                profile.plan === 'pro' && profile.theme
                  ? 'white'
                  : 'var(--card)',
              color: 'var(--foreground)',
            }}>
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-1 text-center text-foreground">
                Support or send a gift 🎁
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Choose an amount or send a vendor gift.
              </p>

              {profile.acceptMoney || profile.acceptVendor ? (
                <>
                  <GiftSelection
                    activeTab={
                      selectedMethod === 'vendor' && profile.acceptVendor
                        ? 'vendor'
                        : profile.acceptMoney
                          ? 'money'
                          : 'vendor'
                    }
                    onTabChange={t =>
                      setSelectedMethod(t as 'money' | 'vendor')
                    }
                    amount={selectedAmount}
                    setAmount={setSelectedAmount}
                    customAmount={customAmount}
                    setCustomAmount={setCustomAmount}
                    selectedGift={selectedVendorGift}
                    setSelectedGift={setSelectedVendorGift}
                    profileTheme={profile.theme}
                    acceptMoney={profile.acceptMoney}
                    acceptVendor={profile.acceptVendor}
                  />

                  <Button
                    variant="hero"
                    className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20 mt-6"
                    style={
                      profile.plan === 'pro' && profile.theme
                        ? {
                            backgroundColor: profile.theme.primary,
                            backgroundImage: 'none',
                          }
                        : {}
                    }
                    onClick={() => setShowGiftModal(true)}>
                    <Gift className="w-5 h-5 mr-2" />
                    {selectedMethod === 'vendor'
                      ? 'Send Gift Card'
                      : 'Send Support'}
                  </Button>
                </>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                    <Gift className="w-8 h-8" />
                  </div>
                  <p className="text-muted-foreground italic">
                    This user isn't accepting gifts right now.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-accent" /> Gifts sent
                recently
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm shadow-sm">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      John sent a{' '}
                      <span className="text-primary font-bold">
                        Coffee Gift
                      </span>{' '}
                      ☕
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground italic text-right">
                    2h ago
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm shadow-sm">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Mary sent a{' '}
                      <span className="text-secondary font-bold">
                        Spa Voucher
                      </span>{' '}
                      💆
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground italic text-right">
                    5h ago
                  </span>
                </div>
              </div>
            </div>

            {profile.showSupporters && (
              <Card
                className="border-border shadow-sm"
                style={{
                  backgroundColor:
                    profile.plan === 'pro' && profile.theme
                      ? 'white'
                      : 'var(--card)',
                  color: 'var(--foreground)',
                }}>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
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
                    {(showAllSupporters
                      ? profile.supporters
                      : profile.supporters.slice(0, 3)
                    ).map(s => (
                      <div key={s.id} className="flex items-start gap-3 group">
                        <Avatar className="w-9 h-9 border border-border group-hover:scale-105 transition-transform">
                          <AvatarFallback className="bg-muted text-xs font-bold">
                            {s.anonymous ? '?' : s.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold">{s.name}</p>
                            <span
                              className="text-sm font-bold"
                              style={{
                                color:
                                  profile.plan === 'pro' &&
                                  profile.theme_settings?.primaryColor
                                    ? profile.theme_settings.primaryColor
                                    : 'var(--primary)',
                              }}>
                              {profile.showAmounts && `$${s.amount}`}
                            </span>
                          </div>
                          {s.message && (
                            <p className="text-xs text-muted-foreground mt-0.5 italic">
                              "{s.message}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {profile.supporters.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setShowAllSupporters(!showAllSupporters)}>
                      {showAllSupporters
                        ? 'Show less'
                        : `Show all ${profile.supporters.length} supporters`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="text-center mt-6">
            <Button variant="outline" className="gap-2 font-semibold">
              <Share2 className="w-4 h-4" /> Share {profile.name}'s page
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
      <SendCreatorGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        creatorName={profile.name}
        minAmount={5}
        initialTab={selectedMethod === 'vendor' ? 'vendor' : 'money'}
        initialAmount={selectedAmount}
        initialGiftId={selectedVendorGift}
        initialCustomAmount={customAmount}
        initialStep="recipient"
      />
    </div>
  );
}
