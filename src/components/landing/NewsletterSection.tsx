'use client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {motion} from 'framer-motion';
import {Mail} from 'lucide-react';

const NewsletterSection = () => {
  return (
    <section className="py-10 sm:py-14 md:py-18 bg-muted/50">
      <div className="container mx-auto px-4 max-w-xl text-center">
        <motion.div
          initial={{opacity: 0, y: 15}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3">
            Stay Updated
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6">
            Get gifting tips, trending campaigns, and updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 max-w-sm mx-auto">
            <Input
              placeholder="Enter your email"
              type="email"
              className="flex-1 h-11"
            />
            <Button variant="hero" className="h-11">Subscribe</Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
