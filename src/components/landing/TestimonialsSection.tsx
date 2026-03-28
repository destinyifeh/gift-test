'use client';

import {motion} from 'framer-motion';
import {Quote, Star} from 'lucide-react';

const testimonials = [
  {
    name: 'Emily R.',
    role: 'Birthday Organizer',
    text: "Gifthance made organizing my mom's surprise gift so easy! Everyone contributed and she was thrilled.",
    rating: 5,
  },
  {
    name: 'James O.',
    role: 'Content Creator',
    text: "My fans can now send me gifts directly through my profile. It's been a game-changer for engagement.",
    rating: 5,
  },
  {
    name: 'Priya S.',
    role: 'Teacher',
    text: 'My students pooled together for a farewell gift. I was so touched! The platform is incredibly easy to use.',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{opacity: 0, y: 15}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}>
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2 sm:mt-3">
              Loved by <span className="text-gradient">gifters everywhere</span>
            </h2>
          </motion.div>
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="block md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{opacity: 0, x: 20}}
                whileInView={{opacity: 1, x: 0}}
                viewport={{once: true}}
                transition={{delay: i * 0.1}}
                className="shrink-0 w-[280px] p-5 rounded-xl bg-card border border-border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({length: t.rating}).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-primary/20" />
                </div>
                <p className="text-sm text-foreground mb-4 leading-relaxed line-clamp-4">
                  "{t.text}"
                </p>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: i * 0.1}}
              className="p-6 lg:p-8 rounded-xl lg:rounded-2xl bg-card border border-border shadow-card">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex gap-0.5 lg:gap-1">
                  {Array.from({length: t.rating}).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-primary/20" />
              </div>
              <p className="text-sm lg:text-base text-foreground mb-5 lg:mb-6 leading-relaxed">
                "{t.text}"
              </p>
              <div>
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-xs lg:text-sm text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
