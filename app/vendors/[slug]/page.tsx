'use client';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import SendGiftModal from '@/components/SendGiftModal';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {ArrowLeft, MapPin, ShoppingBag, Star} from 'lucide-react';
import Link from 'next/link';
import {use, useState} from 'react';

const vendorsData: Record<
  string,
  {
    name: string;
    slug: string;
    description: string;
    logo: string;
    location: string;
    rating: number;
    reviewCount: number;
    products: {
      id: string;
      name: string;
      image: string;
      price: number;
      category: string;
      type: string;
    }[];
  }
> = {
  cakeshop: {
    name: 'Sweet Delights Bakery',
    slug: 'cakeshop',
    description:
      'Premium bakery with 50+ locations. We create custom cakes, pastries, and desserts for every occasion.',
    logo: '🎂',
    location: 'New York, NY',
    rating: 4.8,
    reviewCount: 324,
    products: [
      {
        id: 'AX8H2K',
        name: 'Cake Gift Card - $25',
        image:
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=60',
        price: 25,
        category: 'food',
        type: 'digital',
      },
      {
        id: 'CK50DL',
        name: 'Cake Gift Card - $50',
        image:
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=60',
        price: 50,
        category: 'food',
        type: 'digital',
      },
      {
        id: 'CK100X',
        name: 'Custom Cake Voucher',
        image:
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=60',
        price: 100,
        category: 'food',
        type: 'digital',
      },
      {
        id: 'CKBOX1',
        name: 'Pastry Box Delivery',
        image:
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=60',
        price: 35,
        category: 'food',
        type: 'physical',
      },
    ],
  },
  relaxspa: {
    name: 'Relax Spa',
    slug: 'relaxspa',
    description:
      'Award-winning luxury spa chain offering massages, facials, and wellness treatments.',
    logo: '💆',
    location: 'Los Angeles, CA',
    rating: 4.9,
    reviewCount: 512,
    products: [
      {
        id: 'SP3M9N',
        name: 'Spa Voucher - $50',
        image:
          'https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?w=800&auto=format&fit=crop&q=60',
        price: 50,
        category: 'spa',
        type: 'digital',
      },
      {
        id: 'SP100V',
        name: 'Premium Spa Day',
        image:
          'https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?w=800&auto=format&fit=crop&q=60',
        price: 150,
        category: 'spa',
        type: 'digital',
      },
      {
        id: 'SPCOPL',
        name: 'Couples Spa Package',
        image:
          'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&auto=format&fit=crop&q=60',
        price: 200,
        category: 'spa',
        type: 'digital',
      },
    ],
  },
  stylehub: {
    name: 'StyleHub Fashion',
    slug: 'stylehub',
    description:
      'Trending fashion for all ages. Shop online or in-store across 200+ locations.',
    logo: '👕',
    location: 'Miami, FL',
    rating: 4.7,
    reviewCount: 289,
    products: [
      {
        id: 'FS7K2L',
        name: 'Fashion Gift Card - $75',
        image:
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=60',
        price: 75,
        category: 'fashion',
        type: 'digital',
      },
      {
        id: 'FS50GC',
        name: 'Fashion Gift Card - $50',
        image:
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=60',
        price: 50,
        category: 'fashion',
        type: 'digital',
      },
      {
        id: 'FS25GC',
        name: 'Accessories Voucher',
        image:
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=60',
        price: 25,
        category: 'fashion',
        type: 'digital',
      },
    ],
  },
};

export default function VendorPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = use(params);
  const vendor = slug ? vendorsData[slug] : null;
  const [showGiftModal, setShowGiftModal] = useState(false);

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display text-foreground mb-2">
              Vendor Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              This vendor page doesn't exist.
            </p>
            <Link href="/gift-shop">
              <Button variant="hero">Browse Gift Shop</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            href="/gift-shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Gift Shop
          </Link>

          {/* Vendor header */}
          <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
            <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center text-5xl shrink-0">
              {vendor.logo}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-display text-foreground mb-2">
                {vendor.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />{' '}
                  {vendor.rating} ({vendor.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {vendor.location}
                </span>
              </div>
              <p className="text-muted-foreground">{vendor.description}</p>
            </div>
          </div>

          {/* Products */}
          <h2 className="text-xl font-semibold font-display text-foreground mb-6">
            Gift Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendor.products.map(p => (
              <Card
                key={p.id}
                className="border-border hover:shadow-elevated hover:border-primary/30 transition-all overflow-hidden group">
                <div className="h-40 bg-muted overflow-hidden">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🎁
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{p.category}</Badge>
                    <Badge variant="outline">{p.type}</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ${p.price}
                    </span>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => setShowGiftModal(true)}>
                      Send as Gift
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <SendGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        recipientName={vendor.name}
      />
    </div>
  );
}
