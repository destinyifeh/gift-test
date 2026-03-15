'use client';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import SendGiftModal from '@/components/SendGiftModal';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {ArrowLeft, Heart, Share2, ShoppingBag, Star} from 'lucide-react';
import Link from 'next/link';
import {use, useState} from 'react';

const giftsData: Record<
  string,
  {
    name: string;
    emoji: string;
    price: number;
    vendor: string;
    vendorSlug: string;
    vendorDesc: string;
    category: string;
    type: string;
    rating: number;
    description: string;
  }
> = {
  AX8H2K: {
    name: 'Cake Gift Card',
    emoji: '🎂',
    price: 25,
    vendor: 'Sweet Delights',
    vendorSlug: 'cakeshop',
    vendorDesc: 'Premium bakery with 50+ locations',
    category: 'food',
    type: 'digital',
    rating: 4.8,
    description:
      'Treat someone special to a delicious cake from Sweet Delights. Valid at all locations for 12 months.',
  },
  SP3M9N: {
    name: 'Spa Voucher',
    emoji: '💆',
    price: 50,
    vendor: 'Relax Spa',
    vendorSlug: 'relaxspa',
    vendorDesc: 'Award-winning luxury spa chain',
    category: 'spa',
    type: 'digital',
    rating: 4.9,
    description:
      'A luxurious spa experience including massage, facial, or any treatment of choice. Valid for 6 months.',
  },
  FS7K2L: {
    name: 'Fashion Store Gift Card',
    emoji: '👕',
    price: 75,
    vendor: 'StyleHub',
    vendorSlug: 'stylehub',
    vendorDesc: 'Trending fashion for all ages',
    category: 'fashion',
    type: 'digital',
    rating: 4.7,
    description:
      'Shop the latest fashion trends. Redeemable online and in-store across all StyleHub locations.',
  },
  GM4R8T: {
    name: 'Gaming Store Credit',
    emoji: '🎮',
    price: 30,
    vendor: 'GameVault',
    vendorSlug: 'gamevault',
    vendorDesc: 'Your one-stop gaming destination',
    category: 'birthday',
    type: 'digital',
    rating: 4.6,
    description:
      'Gaming credit redeemable for games, DLC, in-game currency, and accessories.',
  },
  BK2N5P: {
    name: 'Book Store Voucher',
    emoji: '📚',
    price: 20,
    vendor: 'PageTurner',
    vendorSlug: 'pageturner',
    vendorDesc: 'Independent bookstore chain',
    category: 'birthday',
    type: 'digital',
    rating: 4.5,
    description:
      'Perfect for book lovers. Redeemable for any book, audiobook, or e-book.',
  },
  FL9W3Q: {
    name: 'Flower Bouquet Delivery',
    emoji: '💐',
    price: 45,
    vendor: 'BloomBox',
    vendorSlug: 'bloombox',
    vendorDesc: 'Fresh flowers delivered daily',
    category: 'spa',
    type: 'physical',
    rating: 4.8,
    description:
      'A stunning hand-arranged bouquet delivered fresh to their doorstep.',
  },
  MU6Y1R: {
    name: 'Music Streaming Gift',
    emoji: '🎵',
    price: 15,
    vendor: 'TuneWave',
    vendorSlug: 'tunewave',
    vendorDesc: 'Stream millions of songs',
    category: 'birthday',
    type: 'digital',
    rating: 4.4,
    description:
      '3 months of premium music streaming. Ad-free listening with offline downloads.',
  },
  CF8T4S: {
    name: 'Coffee Subscription Box',
    emoji: '☕',
    price: 35,
    vendor: 'BrewCraft',
    vendorSlug: 'brewcraft',
    vendorDesc: 'Artisan coffee roasters',
    category: 'food',
    type: 'physical',
    rating: 4.7,
    description:
      'Monthly delivery of freshly roasted artisan coffee beans from around the world.',
  },
};

export default function GiftDetailPage({
  params,
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = use(params);
  const gift = id ? giftsData[id] : null;
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!gift) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Gift not found</p>
          <Link href="/gift-shop">
            <Button variant="hero">Back to Gift Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            href="/gift-shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 sm:mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Gift Shop
          </Link>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-muted rounded-2xl flex items-center justify-center text-[80px] sm:text-[120px] min-h-[240px] sm:min-h-[320px]">
              {gift.emoji}
            </div>
            <div>
              <div className="flex gap-2 mb-3">
                <Badge variant="secondary">{gift.category}</Badge>
                <Badge variant="outline">{gift.type}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground mb-2">
                {gift.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Star className="w-4 h-4 fill-accent text-accent" />{' '}
                {gift.rating} ·{' '}
                <Link
                  href={`/vendors/${gift.vendorSlug}`}
                  className="text-primary hover:underline">
                  {gift.vendor}
                </Link>
              </div>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                {gift.description}
              </p>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-6">
                ${gift.price}
              </div>
              <Card className="border-border mb-6">
                <CardContent className="p-4">
                  <Link
                    href={`/vendors/${gift.vendorSlug}`}
                    className="hover:underline">
                    <p className="font-semibold text-foreground mb-1">
                      {gift.vendor}
                    </p>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {gift.vendorDesc}
                  </p>
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={() => setShowGiftModal(true)}>
                  <ShoppingBag className="w-4 h-4 mr-2" /> Send as Gift
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setLiked(!liked)}
                  className={
                    liked
                      ? 'text-destructive border-destructive/30 bg-destructive/5'
                      : ''
                  }>
                  <Heart
                    className={`w-4 h-4 ${liked ? 'fill-destructive' : ''}`}
                  />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              {liked && (
                <p className="text-xs text-muted-foreground mt-2">
                  ❤️ Added to your favorites
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <SendGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        recipientName={gift.name}
        preselectedGift={{
          name: gift.name,
          price: gift.price,
          vendor: gift.vendor,
        }}
      />
    </div>
  );
}
