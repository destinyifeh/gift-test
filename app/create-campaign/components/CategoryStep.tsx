'use client';

import {CAMPAIGN_CATEGORIES} from '@/lib/constants/campaigns';
import {motion} from 'framer-motion';

interface CategoryStepProps {
  selectedCategory: string;
  onSelect: (id: string) => void;
}

const container = {
  hidden: {opacity: 0},
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: {opacity: 0, y: 15},
  show: {opacity: 1, y: 0},
};

export function CategoryStep({selectedCategory, onSelect}: CategoryStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          What are you raising funds for?
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Select a category that best describes your campaign
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CAMPAIGN_CATEGORIES.map(c => {
          const isSelected = selectedCategory === c.id;
          return (
            <motion.button
              variants={item}
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`relative overflow-hidden p-5 rounded-2xl text-left transition-all duration-200 group ${
                isSelected
                  ? 'bg-primary border-transparent shadow-lg shadow-primary/25 scale-[1.02]'
                  : 'bg-card border-border border hover:border-primary/40 hover:shadow-md'
              }`}>
              {/* Background Glow Effect */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              )}

              <div className="relative z-10 flex flex-col items-start">
                <div
                  className={`p-3 rounded-xl mb-4 transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                  }`}>
                  <c.icon className="w-6 h-6" />
                </div>
                <h3
                  className={`font-bold text-lg mb-1 leading-tight ${
                    isSelected ? 'text-white' : 'text-foreground'
                  }`}>
                  {c.label}
                </h3>
                <p
                  className={`text-sm ${
                    isSelected ? 'text-white/80' : 'text-muted-foreground'
                  }`}>
                  {c.desc}
                </p>
              </div>

              {/* Selection Indicator */}
              <div
                className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-white bg-white scale-100'
                    : 'border-border scale-0 opacity-0'
                }`}>
                {isSelected && (
                  <motion.div
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    className="w-2.5 h-2.5 rounded-full bg-primary"
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
