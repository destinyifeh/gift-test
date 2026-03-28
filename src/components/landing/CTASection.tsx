'use client';

import {Button} from '@/components/ui/button';
import {motion} from 'framer-motion';
import {ArrowRight, Gift} from 'lucide-react';
import Link from 'next/link';

const CTASection = () => {
  return (
    <section className="py-10 sm:py-14 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{opacity: 0, scale: 0.98}}
          whileInView={{opacity: 1, scale: 1}}
          viewport={{once: true}}
          className="relative rounded-2xl sm:rounded-3xl bg-gradient-hero p-6 sm:p-10 md:p-14 lg:p-16 text-center overflow-hidden">
          {/* Background decorations - smaller on mobile */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4">
              Ready to start gifting?
            </h2>
            <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-md sm:max-w-xl mx-auto">
              Join thousands making every occasion unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm sm:max-w-none mx-auto">
              <Link href="/create-campaign" className="flex-1 sm:flex-initial">
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90 font-semibold text-sm sm:text-base px-6 sm:px-8 shadow-elevated w-full h-11 sm:h-auto">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start a Campaign
                </Button>
              </Link>
              <Link href="/gift-shop" className="flex-1 sm:flex-initial">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary-foreground/30 text-foreground hover:bg-primary-foreground/10 font-semibold text-sm sm:text-base px-6 sm:px-8 w-full h-11 sm:h-auto">
                  Explore Gifts <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
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
