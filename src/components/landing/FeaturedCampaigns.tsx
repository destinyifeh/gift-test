'use client';

import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {motion} from 'framer-motion';
import {ArrowRight, Users} from 'lucide-react';
import Link from 'next/link';

const campaigns = [
  {
    title: "Sarah's 30th Birthday Bash",
    category: 'Birthday',
    raised: 850,
    goal: 1000,
    donors: 23,
    emoji: '🎂',
  },
  {
    title: 'Wedding Gift for Mike & Lisa',
    category: 'Wedding',
    raised: 2400,
    goal: 3000,
    donors: 45,
    emoji: '💒',
  },
  {
    title: 'Thank You Coach Rivera!',
    category: 'Appreciation',
    raised: 320,
    goal: 500,
    donors: 18,
    emoji: '🏆',
  },
  {
    title: 'Baby Shower for Emma',
    category: 'Baby Shower',
    raised: 1200,
    goal: 1500,
    donors: 31,
    emoji: '👶',
  },
];

const FeaturedCampaigns = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-10">
          <motion.div
            initial={{opacity: 0, y: 15}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}>
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              Featured Campaigns
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2 sm:mt-3">
              Trending <span className="text-gradient">right now</span>
            </h2>
          </motion.div>
          <Link href="/campaigns" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="block sm:hidden -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {campaigns.map((c, i) => {
              const slug = c.title
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '');
              return (
                <motion.div
                  key={c.title}
                  initial={{opacity: 0, x: 20}}
                  whileInView={{opacity: 1, x: 0}}
                  viewport={{once: true}}
                  transition={{delay: i * 0.05}}
                  className="shrink-0 w-[260px] rounded-xl bg-card border border-border overflow-hidden active:scale-[0.98] transition-transform">
                  <Link href={`/campaign/mock-${i}/${slug}`}>
                    <div className="h-28 bg-muted relative overflow-hidden">
                      <img
                        src={(c as any).image || '/default-campaign.png'}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-3xl bg-black/5">
                        {c.emoji}
                      </div>
                    </div>
                    <div className="p-3.5">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {c.category}
                      </span>
                      <h3 className="font-semibold text-foreground text-sm mt-0.5 mb-2 line-clamp-1">
                        {c.title}
                      </h3>
                      <Progress
                        value={(c.raised / c.goal) * 100}
                        className="h-1.5 mb-2"
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">
                          ${c.raised.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {c.donors}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {campaigns.map((c, i) => {
            const slug = c.title
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]/g, '');
            return (
              <motion.div
                key={c.title}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{delay: i * 0.08}}
                className="rounded-xl bg-card border border-border overflow-hidden hover:shadow-card hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                <Link href={`/campaign/mock-${i}/${slug}`}>
                  <div className="h-32 lg:h-36 bg-muted relative overflow-hidden">
                    <img
                      src={(c as any).image || '/default-campaign.png'}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-3xl lg:text-4xl bg-black/5">
                      {c.emoji}
                    </div>
                  </div>
                  <div className="p-4 lg:p-5">
                    <span className="text-[10px] lg:text-xs font-semibold text-primary uppercase tracking-wider">
                      {c.category}
                    </span>
                    <h3 className="font-semibold text-foreground text-sm lg:text-base mt-1 mb-2.5 lg:mb-3 font-body line-clamp-2">
                      {c.title}
                    </h3>
                    <Progress
                      value={(c.raised / c.goal) * 100}
                      className="h-1.5 lg:h-2 mb-2.5 lg:mb-3"
                    />
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="font-semibold text-foreground">
                        ${c.raised.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        of ${c.goal.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] lg:text-xs text-muted-foreground mt-1.5 lg:mt-2 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {c.donors} contributors
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: View all link */}
        <div className="mt-6 text-center sm:hidden">
          <Link href="/campaigns">
            <Button variant="outline" size="sm" className="gap-1.5">
              View all campaigns <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCampaigns;
