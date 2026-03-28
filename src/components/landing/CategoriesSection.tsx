'use client';

import {motion} from 'framer-motion';
import {Briefcase, Cake, Gamepad2, Heart, Star, Sun, Users} from 'lucide-react';

const categories = [
  {
    icon: Cake,
    title: 'Celebrations',
    desc: 'Birthdays, Weddings, Anniversaries',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Users,
    title: 'Group Gifts',
    desc: 'Pool money for bigger gifts',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Star,
    title: 'Creator Support',
    desc: 'Support creators you love',
    color: 'bg-accent/20 text-accent-foreground',
  },
  {
    icon: Heart,
    title: 'Appreciation',
    desc: 'Thank mentors & friends',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Gamepad2,
    title: 'Hobbies',
    desc: 'Gamers, artists, fans',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Briefcase,
    title: 'Projects',
    desc: 'Fund creative projects',
    color: 'bg-accent/20 text-accent-foreground',
  },
  {
    icon: Heart,
    title: 'Support & Care',
    desc: 'Get well, encouragement',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Sun,
    title: 'Holidays',
    desc: 'Christmas, Easter & more',
    color: 'bg-secondary/10 text-secondary',
  },
];

const CategoriesSection = () => {
  return (
    <section id="categories" className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header - More compact on mobile */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{opacity: 0, y: 15}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}>
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              Gift Categories
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2 sm:mt-3">
              A gift for <span className="text-gradient">every occasion</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
              Whether it's a celebration, thank-you, or supporting a creator.
            </p>
          </motion.div>
        </div>

        {/* Mobile: Horizontal scroll, Desktop: Grid */}
        <div className="block md:hidden -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{opacity: 0, x: 20}}
                whileInView={{opacity: 1, x: 0}}
                viewport={{once: true}}
                transition={{delay: i * 0.05}}
                className="shrink-0 w-[140px] p-4 rounded-xl bg-card border border-border active:scale-[0.98] transition-transform">
                <div
                  className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center mb-3`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  {cat.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{opacity: 0, y: 15}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: i * 0.05}}
              className="group p-5 lg:p-6 rounded-xl bg-card border border-border hover:shadow-card hover:border-primary/20 transition-all duration-300 cursor-pointer">
              <div
                className={`w-11 h-11 lg:w-12 lg:h-12 rounded-xl ${cat.color} flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5 lg:mb-2 font-body text-sm lg:text-base">
                {cat.title}
              </h3>
              <p className="text-xs lg:text-sm text-muted-foreground">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
