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
    title: 'Trusted Vendor Gift Shop',
    desc: 'Browse and send gift cards from verified vendors you can trust.',
  },
  {
    icon: Shield,
    title: 'Secure & Transparent',
    desc: 'Every gift is tracked, protected, and easy to manage.',
  },
  {
    icon: Gift,
    title: 'Campaign Fundraising',
    desc: 'Rally friends and family to contribute towards any occasion.',
  },
  {
    icon: Share2,
    title: 'One-Click Sharing',
    desc: 'Share campaigns instantly via WhatsApp, Instagram, Twitter & Email.',
  },
  {
    icon: LineChart,
    title: 'Real-Time Tracking',
    desc: 'Watch contributions grow with live progress and analytics.',
  },
  {
    icon: Heart,
    title: 'Creator Support',
    desc: 'Send love and gifts directly to your favourite creators.',
  },
  {
    icon: Wallet,
    title: 'Easy Withdrawals',
    desc: 'Cash out your gifts to your bank account quickly and easily.',
  },
  {
    icon: ShoppingBag,
    title: 'Gift Card Marketplace',
    desc: 'Discover curated gift cards from trusted vendors nationwide.',
  },
];

const WhyGifthanceSection = () => {
  return (
    <section id="why-gifthance" className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Why Gifthance
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
              Everything You Need to{' '}
              <span className="text-gradient">Give Better</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              From trusted gift shops to real-time campaign tracking — Gifthance
              makes every gift memorable, secure, and effortless.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: i * 0.06}}
              className="p-6 rounded-xl bg-card border border-border hover:shadow-card hover:border-secondary/30 transition-all duration-300">
              <div className="w-11 h-11 rounded-lg bg-gradient-teal flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 font-body">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyGifthanceSection;
