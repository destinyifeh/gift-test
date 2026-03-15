'use client';

import {Button} from '@/components/ui/button';
import {AnimatePresence, motion} from 'framer-motion';
import {Gift, Menu, X} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  const mainLinks = [
    {label: 'Gift Shop', href: '/gift-shop'},
    {label: 'Campaigns', href: '/campaigns'},
    {label: 'Developers', href: '/developers'},
  ];

  const homeLinks = [
    {label: 'How It Works', href: '#how-it-works'},
    {label: 'Categories', href: '#categories'},
    {label: 'FAQ', href: '#faq'},
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-display text-foreground">
            Gifthance
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {mainLinks.map(link => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              {link.label}
            </Link>
          ))}
          {isHome &&
            homeLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: 'auto', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            className="md:hidden bg-background border-b border-border overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-3">
              {mainLinks.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground py-2"
                  onClick={() => setIsOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {isHome &&
                homeLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground py-2"
                    onClick={() => setIsOpen(false)}>
                    {link.label}
                  </a>
                ))}
              <div className="flex gap-3 pt-2">
                <Link
                  href="/login"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link
                  href="/signup"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}>
                  <Button variant="hero" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
