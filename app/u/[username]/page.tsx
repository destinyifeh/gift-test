'use client';

import GiftSelection from '@/components/GiftSelection';
import Navbar from '@/components/landing/Navbar';
import SendCreatorGiftModal from '@/components/SendCreatorGiftModal';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {useProfileByUsername} from '@/hooks/use-profile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {fetchCreatorSupporters} from '@/lib/server/actions/analytics';
import {useUserStore} from '@/lib/store/useUserStore';
import {formatCurrency} from '@/lib/utils/currency';
import {useInfiniteQuery} from '@tanstack/react-query';
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

export default function CreatorProfilePage({
  params,
}: {
  params: Promise<{username: string}>;
}) {
  const {username} = use(params);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'money' | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showAllSupporters, setShowAllSupporters] = useState(false);

  const loggedInUser = useUserStore((state: any) => state.user);
  const {data: dbProfile, isLoading} = useProfileByUsername(username);

  // Fetch real supporters data with infinite scroll
  const {
    data: supportersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['creator-supporters', username],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) => fetchCreatorSupporters({username, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    enabled: !!username,
  });

  const allSupporters = supportersData?.pages.flatMap(p => p.data || []) || [];
  const totalSupporters = supportersData?.pages[0]?.totalSupporters || 0;
  const totalReceived = supportersData?.pages[0]?.totalReceived || 0;

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
  const isCreatorEnabled = dbProfile?.is_creator;

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

  const plan = dbProfile?.theme_settings?.plan || 'free';

  const theme = {
    primary: dbProfile?.theme_settings?.primaryColor || 'hsl(16 85% 60%)',
    background: dbProfile?.theme_settings?.bgColor || 'var(--background)',
    text: dbProfile?.theme_settings?.textColor || 'var(--foreground)',
  };

  const profile = {
    name: dbProfile?.display_name || username || 'User',
    bio: dbProfile?.bio || 'No bio yet.',
    suggestedAmounts: dbProfile?.suggested_amounts || [5, 10, 25],
    showSupporters: dbProfile?.theme_settings?.showSupporters ?? true,
    showAmounts: dbProfile?.theme_settings?.showAmounts ?? true,
    acceptMoney: dbProfile?.theme_settings?.acceptMoney ?? true,
    acceptVendor: false, // Gift cards removed from creator page for simplicity
    plan,
    theme_settings: dbProfile?.theme_settings || {},
    theme,
    currencySymbol: getCurrencySymbol(
      getCurrencyByCountry(dbProfile?.country || 'Nigeria'),
    ),
    banner:
      plan === 'pro' && dbProfile?.theme_settings?.proBanner
        ? dbProfile?.theme_settings?.proBanner
        : undefined,
    removeBranding:
      plan === 'pro'
        ? (dbProfile?.theme_settings?.proRemoveBranding ?? false)
        : false,
    supporters: allSupporters,
    totalReceived,
    totalSupporters,
    socialLinks: dbProfile?.social_links || {},
    vendorGifts: [],
  };

  const isDetailsValid =
    (selectedAmount !== null && selectedAmount > 0) ||
    (customAmount !== '' && Number(customAmount) > 0);

  const customStyles =
    profile.plan === 'pro'
      ? ({
          '--creator-primary': profile.theme.primary,
          '--creator-bg': profile.theme.background,
          '--creator-text': profile.theme.text,
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
          profile.plan === 'pro'
            ? profile.theme.background
            : 'var(--background)',
        color:
          profile.plan === 'pro' ? profile.theme.text : 'var(--foreground)',
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
                  profile.plan === 'pro'
                    ? {
                        backgroundColor: profile.theme.primary,
                        color: 'white',
                      }
                    : {}
                }>
                {profile.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold font-display capitalize">
              {profile.name}
            </h1>
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
                      profile.plan === 'pro'
                        ? profile.theme.primary
                        : 'var(--primary)',
                  }}
                />{' '}
                {profile.totalSupporters} supporters
              </span>
              <span className="flex items-center gap-1">
                <Gift className="w-4 h-4 text-secondary" />
                {formatCurrency(
                  profile.totalReceived,
                  getCurrencyByCountry(dbProfile?.country || 'Nigeria'),
                )}{' '}
                received
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
                Send Support 🎁
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Choose an amount to support this creator.
              </p>

              {profile.acceptMoney ? (
                <>
                  <GiftSelection
                    activeTab="money"
                    onTabChange={() => {}}
                    amount={selectedAmount}
                    setAmount={setSelectedAmount}
                    customAmount={customAmount}
                    setCustomAmount={setCustomAmount}
                    selectedGift={null}
                    setSelectedGift={() => {}}
                    profileTheme={profile.theme}
                    acceptMoney={profile.acceptMoney}
                    acceptVendor={false}
                    currencySymbol={profile.currencySymbol}
                    currencyCode={getCurrencyByCountry(
                      dbProfile?.country || 'Nigeria',
                    )}
                    vendorGifts={[]}
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
                    disabled={!isDetailsValid}
                    onClick={() => setShowGiftModal(true)}>
                    <Gift className="w-5 h-5 mr-2" />
                    Send Support
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
                {profile.supporters.length > 0 ? (
                  profile.supporters.slice(0, 3).map((s: any) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm shadow-sm shrink-0">
                        {s.anonymous ? '🙈' : '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-foreground truncate capitalize">
                            {s.name}
                          </p>
                        </div>{' '}
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {s.giftName ? (
                            <span className="text-primary font-bold">
                              {s.giftName}
                            </span>
                          ) : (
                            <span className="text-primary font-bold">
                              {!s.hideAmount
                                ? formatCurrency(s.amount, s.currency)
                                : 'a gift'}
                            </span>
                          )}
                        </p>
                        {s.message && (
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 italic">
                            "{s.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No gifts received yet. Be the first to support!
                  </p>
                )}
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
                    Supporters ({profile.totalSupporters})
                  </h3>
                  <div className="space-y-4">
                    {profile.supporters.length > 0 ? (
                      <>
                        {(showAllSupporters
                          ? profile.supporters
                          : profile.supporters.slice(0, 5)
                        ).map((s: any) => (
                          <div
                            key={s.id}
                            className="flex items-start gap-3 group">
                            <Avatar className="w-9 h-9 border border-border group-hover:scale-105 transition-transform">
                              <AvatarFallback className="bg-muted text-xs font-bold capitalize">
                                {s.anonymous ? '?' : s.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold capitalize">
                                  {s.name}
                                </p>
                                {profile.showAmounts && !s.hideAmount && (
                                  <span
                                    className="text-sm font-bold"
                                    style={{
                                      color:
                                        profile.plan === 'pro'
                                          ? profile.theme.primary
                                          : 'var(--primary)',
                                    }}>
                                    {formatCurrency(s.amount, s.currency)}
                                  </span>
                                )}
                                {s.hideAmount && (
                                  <span className="text-xs text-muted-foreground italic">
                                    hidden
                                  </span>
                                )}
                              </div>
                              {s.message && (
                                <p className="text-xs text-muted-foreground mt-0.5 italic">
                                  "{s.message}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {showAllSupporters && (
                          <InfiniteScroll
                            hasMore={!!hasNextPage}
                            isLoading={isFetchingNextPage}
                            onLoadMore={fetchNextPage}
                          />
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No supporters yet.
                      </p>
                    )}
                  </div>

                  {profile.supporters.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setShowAllSupporters(!showAllSupporters)}>
                      {showAllSupporters
                        ? 'Show less'
                        : `Show all ${profile.totalSupporters} supporters`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="text-center mt-6">
            <Button variant="outline" className="gap-2 font-semibold">
              <Share2 className="w-4 h-4" /> Share{' '}
              <span className="capitalize">{profile.name}</span>'s page
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
        creatorUsername={username}
        minAmount={5}
        initialAmount={selectedAmount}
        initialCustomAmount={customAmount}
        initialStep="recipient"
        currency={getCurrencyByCountry(dbProfile?.country || 'Nigeria')}
      />
    </div>
  );
}
