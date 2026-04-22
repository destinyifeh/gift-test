'use client';

import {Button} from '@/components/ui/button';
import {useProfile} from '@/hooks/use-profile';
import {signOut} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import {AnimatePresence, motion} from 'framer-motion';
import {
  ChevronDown,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isHome = pathname === '/';
  const {user, clearUser} = useUserStore();
  const {data: profile} = useProfile();

  const roles = profile?.roles || ['user'];
  const isVendor = roles.includes('vendor');
  const isAdmin = roles.includes('admin') || !!profile?.admin_role;

  // Close role menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        roleMenuRef.current &&
        !roleMenuRef.current.contains(e.target as Node)
      ) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    // Clear local state immediately for better UX
    queryClient.clear();
    clearUser();
    router.push('/login');

    const result = await signOut();
    if (result.success) {
      toast.success('Signed out successfully');
    } else {
      toast.error(result.error || 'Failed to sign out on server');
    }
  };

  // Show Developers only on the landing page
  const mainLinks = [
    {label: 'Gift Shop', href: '/gift-shop'},
    {label: 'Campaigns', href: '/campaigns'},
    ...(user ? [{label: 'Send Gift', href: '/send-gift'}] : []),
  ].filter(l => user || !['/send-gift', '/dashboard', '/admin', '/vendor'].includes(l.href));

  const homeLinks = [
    {label: 'How It Works', href: '#how-it-works'},
    {label: 'Categories', href: '#categories'},
    {label: 'FAQ', href: '#faq'},
  ];

  const hasMultipleRoles = isVendor || isAdmin;

  const roleItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: 'Vendor Panel',
      href: '/vendor',
      icon: Store,
      show: isVendor,
    },
    {
      label: 'Admin Panel',
      href: '/admin',
      icon: ShieldCheck,
      show: isAdmin,
    },
  ].filter(item => item.show);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-14 md:h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Gift className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg sm:text-xl font-bold font-display text-foreground">
            Gifthance
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-5 lg:gap-6">
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

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {hasMultipleRoles ? (
                <div className="relative" ref={roleMenuRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-full px-4 border-border/80 hover:border-primary/40 transition-all"
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}>
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${roleMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </Button>

                  <AnimatePresence>
                    {roleMenuOpen && (
                      <motion.div
                        initial={{opacity: 0, y: -4, scale: 0.95}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: -4, scale: 0.95}}
                        transition={{duration: 0.15}}
                        className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                        <div className="py-1">
                          {roleItems.map(item => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setRoleMenuOpen(false)}
                                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                                  isActive
                                    ? 'text-primary bg-primary/5'
                                    : 'text-foreground hover:bg-muted/50'
                                }`}>
                                <Icon className="w-4 h-4" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                        <div className="border-t border-border">
                          <button
                            onClick={() => {
                              setRoleMenuOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 w-full transition-colors">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-full px-4 border-border/80 hover:border-primary/40 transition-all">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Button>
                </Link>
              )}

              {!hasMultipleRoles && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Sign Out</span>
                </Button>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full px-4">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="hero" size="sm" className="rounded-full px-5">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 -mr-2 text-foreground active:bg-muted/50 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: 'auto', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.2}}
            className="md:hidden bg-background border-b border-border overflow-hidden">
            <div className="px-4 py-3 flex flex-col">
              {/* Main navigation links */}
              <div className="space-y-0.5">
                {mainLinks.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`flex items-center text-sm font-medium py-3 px-3 rounded-lg transition-colors ${
                      pathname === link.href
                        ? 'text-primary bg-primary/5'
                        : 'text-foreground active:bg-muted/50'
                    }`}
                    onClick={() => setIsOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                {isHome &&
                  homeLinks.map(link => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="flex items-center text-sm font-medium text-muted-foreground py-3 px-3 rounded-lg active:bg-muted/50 transition-colors"
                      onClick={() => setIsOpen(false)}>
                      {link.label}
                    </a>
                  ))}
              </div>

              {/* Divider and auth section */}
              <div className="border-t border-border mt-3 pt-3">
                {user ? (
                  <div className="space-y-0.5">
                    {roleItems.map(item => {
                      const Icon = item.icon;
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-primary bg-primary/5'
                              : 'text-foreground active:bg-muted/50'
                          }`}
                          onClick={() => setIsOpen(false)}>
                          <Icon className="w-4.5 h-4.5" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-medium text-destructive active:bg-destructive/5 w-full transition-colors">
                      <LogOut className="w-4.5 h-4.5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 pt-1">
                    <Link
                      href="/login"
                      className="flex-1"
                      onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-full text-sm">
                        Log In
                      </Button>
                    </Link>
                    <Link
                      href="/signup"
                      className="flex-1"
                      onClick={() => setIsOpen(false)}>
                      <Button
                        variant="hero"
                        className="w-full h-11 rounded-full text-sm">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
