'use client';

import heroImage from '@/assets/hero-illustration.png';
import {Button} from '@/components/ui/button';
import {motion} from 'framer-motion';
import {ArrowRight, Gift, Heart, ShoppingBag, Users} from 'lucide-react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="relative pt-16 pb-8 sm:pt-20 sm:pb-12 md:pt-28 md:pb-20 overflow-hidden bg-gradient-warm">
      {/* Background decorations - smaller on mobile */}
      <div className="absolute top-10 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Content - Mobile optimized */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className="text-center lg:text-left">
            {/* Badge - Smaller on mobile */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Enhancing the joy of giving
            </div>

            {/* Title - Better mobile scaling */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground mb-4 sm:mb-6">
              Gift and support the people you{' '}
              <span className="text-gradient">care about</span>
            </h1>

            {/* Subtitle - More concise on mobile */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
              Celebrate special occasions or support your favorite creators with meaningful gifts.
            </p>

            {/* CTA Buttons - Full width on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8 max-w-sm sm:max-w-none mx-auto lg:mx-0">
              <Link href="/gift-shop" className="flex-1 sm:flex-initial">
                <Button
                  variant="hero"
                  size="lg"
                  className="text-sm sm:text-base px-6 sm:px-8 w-full h-12 sm:h-auto">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Browse Gifts
                </Button>
              </Link>
              <Link href="/create-campaign" className="flex-1 sm:flex-initial">
                <Button
                  variant="hero-outline"
                  size="lg"
                  className="text-sm sm:text-base px-6 sm:px-8 w-full h-12 sm:h-auto">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start Campaign
                </Button>
              </Link>
            </div>

            {/* Social Proof - Horizontal scroll on mobile */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['🎂', '🎁', '💐', '🎉'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-base sm:text-lg border-2 border-background">
                    {emoji}
                  </div>
                ))}
              </div>
              <span>
                Join <strong className="text-foreground">10,000+</strong> happy gifters
              </span>
            </div>
          </motion.div>

          {/* Hero Image - Hidden on mobile, shown from sm up */}
          <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.5, delay: 0.15}}
            className="relative hidden lg:block">
            <img
              src={heroImage.src}
              alt="People exchanging gifts together"
              className="w-full max-w-md xl:max-w-lg mx-auto rounded-2xl shadow-elevated animate-float"
            />
          </motion.div>
        </div>

        {/* Quick Actions - Mobile only, horizontal scroll */}
        <motion.div
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.2}}
          className="mt-8 lg:hidden">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <Link href="/campaigns" className="shrink-0">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border hover:border-primary/30 transition-colors">
                <Gift className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  Public Campaigns
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/gift-shop" className="shrink-0">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border hover:border-primary/30 transition-colors">
                <ShoppingBag className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  Gift Shop
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
