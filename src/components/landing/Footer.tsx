import {Gift} from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const columns = [
    {
      title: 'Product',
      links: [
        {label: 'Gifts', to: '/gifts'},
        {label: 'Campaigns', to: '/campaigns'},
        {label: 'Create Campaign', to: '/create-campaign'},
        {label: 'Dashboard', to: '/dashboard'},
      ],
    },
    {
      title: 'Features',
      links: [
        {label: 'Gifts', to: '/gifts'},
        {label: 'Campaigns', to: '/campaigns'},
        {label: 'Creator Support', to: '/campaigns'},
        {label: 'Gifts Marketplace', to: '/gifts'},
      ],
    },
    {
      title: 'Company',
      links: [
        {label: 'About Us', to: '#'},
        {label: 'Blog', to: '#'},
        {label: 'Careers', to: '#'},
        {label: 'Contact', to: '#'},
      ],
    },
    {
      title: 'Legal',
      links: [
        {label: 'Privacy Policy', to: '#'},
        {label: 'Terms of Service', to: '#'},
        {label: 'Cookie Policy', to: '#'},
      ],
    },
  ];

  return (
    <footer className="bg-foreground py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Mobile Layout: 2 columns stacked */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand - Full width on mobile */}
          <div className="col-span-2 md:col-span-1 mb-4 md:mb-0">
            <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Gift className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold font-display text-background">
                Gifthance
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-background/70 leading-relaxed max-w-xs">
              Making every occasion special through the power of collective giving.
            </p>
          </div>

          {/* Link columns */}
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-background mb-3 sm:mb-4 text-xs sm:text-sm font-body">
                {col.title}
              </h4>
              <ul className="space-y-2 sm:space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.to}
                      className="text-xs sm:text-sm text-background/70 hover:text-background transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-background/40">
            © {new Date().getFullYear()} Gifthance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
