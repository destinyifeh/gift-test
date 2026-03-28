'use client';

import {motion} from 'framer-motion';
import {CreditCard, PenLine, Share2, Wallet} from 'lucide-react';

const steps = [
  {
    icon: PenLine,
    step: '1',
    title: 'Create Campaign',
    desc: 'Set up your gift campaign with title, goal, and details.',
  },
  {
    icon: Share2,
    step: '2',
    title: 'Share Link',
    desc: 'Share your unique URL with friends and family.',
  },
  {
    icon: CreditCard,
    step: '3',
    title: 'Collect Gifts',
    desc: 'Contributors send gifts easily and securely.',
  },
  {
    icon: Wallet,
    step: '4',
    title: 'Claim Funds',
    desc: 'Recipient withdraws to their bank account.',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{opacity: 0, y: 15}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}>
            <span className="text-xs sm:text-sm font-semibold text-secondary uppercase tracking-wider">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2 sm:mt-3">
              Simple as <span className="text-gradient">1-2-3-4</span>
            </h2>
          </motion.div>
        </div>

        {/* Mobile: Vertical timeline, Desktop: Horizontal */}
        <div className="md:hidden space-y-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{opacity: 0, x: -15}}
              whileInView={{opacity: 1, x: 0}}
              viewport={{once: true}}
              transition={{delay: i * 0.1}}
              className="flex gap-4 items-start">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft shrink-0">
                  <s.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-12 bg-gradient-to-b from-primary/30 to-transparent mt-2" />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pb-4">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Step {s.step}
                </span>
                <h3 className="text-base font-bold text-foreground mt-0.5 mb-1 font-body">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: i * 0.1}}
              className="relative text-center">
              {/* Connection line - desktop only */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-hero mx-auto mb-4 lg:mb-5 flex items-center justify-center shadow-soft">
                <s.icon className="w-6 h-6 lg:w-8 lg:h-8 text-primary-foreground" />
              </div>
              <span className="text-[10px] lg:text-xs font-bold text-primary uppercase tracking-widest">
                Step {s.step}
              </span>
              <h3 className="text-base lg:text-lg font-bold text-foreground mt-1.5 lg:mt-2 mb-1.5 lg:mb-2 font-body">
                {s.title}
              </h3>
              <p className="text-xs lg:text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
