'use client';

import {Button} from '@/components/ui/button';
import {motion} from 'framer-motion';
import {ArrowRight, Gift} from 'lucide-react';
import Link from 'next/link';

const CTASection = () => {
  return (
    <section className="py-16 sm:py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{opacity: 0, scale: 0.95}}
          whileInView={{opacity: 1, scale: 1}}
          viewport={{once: true}}
          className="relative rounded-3xl bg-gradient-hero p-8 sm:p-10 md:p-16 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Ready to start gifting?
            </h2>
            <p className="text-primary-foreground/80 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Join thousands of people making every occasion unforgettable.
              Start a campaign or explore gifts today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/create-campaign">
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90 font-semibold text-base px-8 shadow-elevated w-full sm:w-auto">
                  <Gift className="w-5 h-5 mr-2" />
                  Start a Campaign
                </Button>
              </Link>
              <Link href="/gift-shop">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary-foreground/30 text-foreground hover:bg-primary-foreground/10 font-semibold text-base px-8 w-full sm:w-auto">
                  Explore Gifts <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
