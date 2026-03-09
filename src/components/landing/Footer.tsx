import { Gift } from "lucide-react";

const Footer = () => {
  const columns = [
    {
      title: "Product",
      links: ["Send a Gift", "Start Campaign", "Gift Marketplace", "Pricing"],
    },
    {
      title: "Developers",
      links: ["API Docs", "Widget SDK", "NPM Package", "Webhooks"],
    },
    {
      title: "Company",
      links: ["About Us", "Blog", "Careers", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
    },
  ];

  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Gift className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold font-display text-background">GiftTogether</span>
            </div>
            <p className="text-sm text-background/50">
              Making every occasion special through the power of collective giving.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-background mb-4 text-sm font-body">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-background/50 hover:text-background transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 pt-8 text-center">
          <p className="text-sm text-background/40">
            © {new Date().getFullYear()} GiftTogether. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
