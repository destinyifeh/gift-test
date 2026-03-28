'use client';

import {motion} from 'framer-motion';
import {
  Gift,
  Heart,
  LineChart,
  Shield,
  Share2,
  ShoppingBag,
  Store,
  Wallet,
} from 'lucide-react';

const features = [
  {
    icon: Store,
    title: 'Trusted Gift Shop',
    desc: 'Verified vendors you can trust.',
  },
  {
    icon: Shield,
    title: 'Secure & Safe',
    desc: 'Protected and easy to manage.',
  },
  {
    icon: Gift,
    title: 'Campaign Fundraising',
    desc: 'Rally friends and family.',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    desc: 'Share via WhatsApp, X, Email.',
  },
  {
    icon: LineChart,
    title: 'Real-Time Tracking',
    desc: 'Watch contributions grow.',
  },
  {
    icon: Heart,
    title: 'Creator Support',
    desc: 'Gift your favorite creators.',
  },
  {
    icon: Wallet,
    title: 'Easy Withdrawals',
    desc: 'Cash out to your bank.',
  },
  {
    icon: ShoppingBag,
    title: 'Gift Marketplace',
    desc: 'Curated gift cards nationwide.',
  },
];

const WhyGifthanceSection = () => {
  return (
    <section id="why-gifthance" className="py-12 sm:py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{opacity: 0, y: 15}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}>
            <span className="text-xs sm:text-sm font-semibold text-secondary uppercase tracking-wider">
              Why Gifthance
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2 sm:mt-3">
              Everything to{' '}
              <span className="text-gradient">Give Better</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
              Trusted gift shops, real-time tracking, and secure transactions.
            </p>
          </motion.div>
        </div>

        {/* Mobile: 2-column compact grid */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{opacity: 0, y: 10}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: i * 0.04}}
              className="p-4 rounded-xl bg-card border border-border">
              <div className="w-9 h-9 rounded-lg bg-gradient-teal flex items-center justify-center mb-2.5">
                <f.icon className="w-4 h-4 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tablet/Desktop: 4-column grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{opacity: 0, y: 15}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: i * 0.05}}
              className="p-5 lg:p-6 rounded-xl bg-card border border-border hover:shadow-card hover:border-secondary/30 transition-all duration-300">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-gradient-teal flex items-center justify-center mb-3 lg:mb-4">
                <f.icon className="w-4 h-4 lg:w-5 lg:h-5 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5 lg:mb-2 font-body text-sm lg:text-base">
                {f.title}
              </h3>
              <p className="text-xs lg:text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyGifthanceSection;
