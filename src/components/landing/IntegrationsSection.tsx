import { motion } from "framer-motion";
import { Code, Smartphone, Share2, LayoutTemplate, BarChart3, Paintbrush, Globe, Puzzle } from "lucide-react";

const features = [
  { icon: Globe, title: "Website Widget", desc: "Embeddable gifting widget for blogs or websites." },
  { icon: Smartphone, title: "Mobile SDK / NPM", desc: "Integrate gifting flows directly into mobile apps." },
  { icon: Share2, title: "Social Sharing Tools", desc: "One-click sharing for WhatsApp, Instagram, Twitter, Email." },
  { icon: LayoutTemplate, title: "Prebuilt Templates", desc: "High-conversion campaign layouts ready to use." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track contributions, donor count, and progress in real-time." },
  { icon: Paintbrush, title: "White-Label Options", desc: "Customize to match your platform's branding seamlessly." },
  { icon: Puzzle, title: "Platform-Wide Gifting", desc: "Embed our widget or SDK across all your users." },
  { icon: Code, title: "Developer API", desc: "Full REST API with webhooks and documentation." },
];

const IntegrationsSection = () => {
  return (
    <section id="integrations" className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Integrations</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
              Integrate & Share <span className="text-gradient">Anywhere</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Give your entire app the power of gifting. Embed our widget or SDK across all your users.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="p-6 rounded-xl bg-card border border-border hover:shadow-card hover:border-secondary/30 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg bg-gradient-teal flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 font-body">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
