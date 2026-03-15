'use client';

import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {motion} from 'framer-motion';
import {ArrowRight} from 'lucide-react';
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
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Featured Campaigns
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
              Trending <span className="text-gradient">right now</span>
            </h2>
          </motion.div>
          <Link href="/campaigns">
            <Button variant="ghost" className="mt-4 md:mt-0 text-primary">
              View all campaigns <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {campaigns.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: i * 0.1}}
              className="rounded-xl bg-card border border-border overflow-hidden hover:shadow-card transition-all duration-300 group cursor-pointer">
              <div className="h-36 bg-muted flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                {c.emoji}
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {c.category}
                </span>
                <h3 className="font-bold text-foreground mt-1 mb-3 font-body line-clamp-2">
                  {c.title}
                </h3>
                <Progress
                  value={(c.raised / c.goal) * 100}
                  className="h-2 mb-3"
                />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-foreground">
                    ${c.raised.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    of ${c.goal.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {c.donors} contributors
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCampaigns;
