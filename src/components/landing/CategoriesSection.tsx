'use client';

import {motion} from 'framer-motion';
import {Briefcase, Cake, Gamepad2, Heart, Star, Sun, Users} from 'lucide-react';

const categories = [
  {
    icon: Cake,
    title: 'Celebration Gifts',
    desc: 'Birthdays, Weddings, Anniversaries, Baby Showers',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Users,
    title: 'Group Contributions',
    desc: 'Pool money together for bigger, better gifts',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Star,
    title: 'Creator & Influencer Gifts',
    desc: 'Support your favorite creators and influencers',
    color: 'bg-accent/20 text-accent-foreground',
  },
  {
    icon: Heart,
    title: 'Appreciation Gifts',
    desc: 'Thank teachers, mentors, coworkers, friends',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Gamepad2,
    title: 'Hobby & Interest Gifts',
    desc: 'For gamers, artists, sports fans, music lovers',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Briefcase,
    title: 'Gift for Projects',
    desc: "Support someone's creative or personal project",
    color: 'bg-accent/20 text-accent-foreground',
  },
  {
    icon: Heart,
    title: 'Support & Care Gifts',
    desc: 'Get well soon, encouragement, tough times',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Sun,
    title: 'Holiday & Seasonal Gifts',
    desc: "Christmas, Valentine's Day, Easter, Thanksgiving",
    color: 'bg-secondary/10 text-secondary',
  },
];

const container = {
  hidden: {},
  show: {transition: {staggerChildren: 0.08}},
};

const item = {
  hidden: {opacity: 0, y: 20},
  show: {opacity: 1, y: 0},
};

const CategoriesSection = () => {
  return (
    <section id="categories" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Gift Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
              A gift for <span className="text-gradient">every occasion</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Whether it's a birthday celebration, a thank-you gesture, or
              supporting a creator — we've got you covered.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{once: true}}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map(cat => (
            <motion.div
              key={cat.title}
              variants={item}
              className="group p-6 rounded-xl bg-card border border-border hover:shadow-card hover:border-primary/20 transition-all duration-300 cursor-pointer">
              <div
                className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 font-body">
                {cat.title}
              </h3>
              <p className="text-sm text-muted-foreground">{cat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
