'use client';

import heroImage from '@/assets/hero-illustration.png';
import {Button} from '@/components/ui/button';
import {motion} from 'framer-motion';
import {Gift, Heart, Users} from 'lucide-react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-24 overflow-hidden bg-gradient-warm">
      <div className="absolute top-20 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.7}}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              The joy of giving, simplified
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
              Gift and support the people you{' '}
              <span className="text-gradient">care about</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
              Celebrate birthdays, weddings, and special occasions, or send
              gifts to your favorite creators and influencers.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10">
              <Link href="/dashboard">
                <Button
                  variant="hero"
                  size="lg"
                  className="text-base px-8 w-full sm:w-auto">
                  <Gift className="w-5 h-5 mr-2" />
                  Send a Gift
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  variant="hero-outline"
                  size="lg"
                  className="text-base px-8 w-full sm:w-auto">
                  <Users className="w-5 h-5 mr-2" />
                  Start a Campaign
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {['🎂', '🎁', '💐', '🎉'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg border-2 border-background">
                    {emoji}
                  </div>
                ))}
              </div>
              <span>
                Join <strong className="text-foreground">10,000+</strong> happy
                gifters
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.7, delay: 0.2}}
            className="relative hidden sm:block">
            <img
              src={heroImage.src}
              alt="People exchanging gifts together"
              className="w-full max-w-lg mx-auto rounded-2xl shadow-elevated animate-float"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
