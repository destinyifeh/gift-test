import { motion } from "framer-motion";
import { PenLine, Share2, CreditCard, Wallet } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    step: "01",
    title: "Create a Gift Campaign",
    desc: "Add a title, description, goal amount, images, and recipient email.",
  },
  {
    icon: Share2,
    step: "02",
    title: "Share Your Link",
    desc: "Get a unique URL to share with friends, family, or fans.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Collect Contributions",
    desc: "Friends and family contribute. Claimable gifts can be claimed later.",
  },
  {
    icon: Wallet,
    step: "04",
    title: "Recipient Claims Funds",
    desc: "Money goes directly to the recipient's connected account.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
              Simple as <span className="text-gradient">1-2-3-4</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              <div className="w-20 h-20 rounded-2xl bg-gradient-hero mx-auto mb-5 flex items-center justify-center shadow-soft">
                <s.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Step {s.step}</span>
              <h3 className="text-lg font-bold text-foreground mt-2 mb-2 font-body">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
