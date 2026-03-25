'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {motion} from 'framer-motion';

const faqs = [
  {
    q: 'How does claimable gifting work?',
    a: 'When you send a claimable gift, the recipient receives a unique link. They can claim the gift amount into their connected payment account at any time.',
  },
  {
    q: 'When do recipients get paid?',
    a: 'Recipients can withdraw funds as soon as contributions are received. Payouts typically process within 1-3 business days depending on the payment provider.',
  },
  {
    q: 'How much is the platform fee?',
    a: 'Gifthance charges a small platform fee of 2.9% + $0.30 per transaction. There are no monthly fees or hidden charges.',
  },
  {
    q: 'Can I use this for group gifts?',
    a: 'Absolutely! Group gifting is one of our core features. Create a campaign, share the link, and let everyone contribute toward a common gift goal.',
  },
  {
    q: 'How does the Gift Shop work?',
    a: 'Our Gift Shop features curated gift cards from verified vendors. Browse available options, purchase a gift card, and the recipient will receive a unique code to redeem their gift.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes! We use industry-standard encryption and partner with trusted payment providers like Stripe for secure transactions.',
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-14">
          <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </motion.div>
        </div>

        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border border-border rounded-xl px-6">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline font-body">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
