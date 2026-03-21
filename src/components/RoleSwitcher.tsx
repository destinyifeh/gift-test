'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {useProfile} from '@/hooks/use-profile';
import {
  Check,
  ChevronDown,
  LayoutDashboard,
  Shield,
  Store,
  Users,
} from 'lucide-react';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

export function RoleSwitcher() {
  const {data: profile, isLoading} = useProfile();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading || !profile?.roles || profile.roles.length <= 1) {
    return null; // Show nothing if user only has 1 role ('user') or is loading
  }

  const roleConfigs = [
    {
      id: 'user',
      label: 'Personal',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'vendor',
      label: 'Vendor Dashboard',
      path: '/vendor',
      icon: Store,
    },
    {
      id: 'partner',
      label: 'Partner Dashboard',
      path: '/partner',
      icon: Users,
    },
    {
      id: 'admin',
      label: 'Admin Dashboard',
      path: '/admin',
      icon: Shield,
    },
  ];

  // Only show options for roles the user actually has
  const availableRoles = roleConfigs.filter(config =>
    profile.roles.includes(config.id),
  );

  // If somehow they don't have available roles, render nothing
  if (availableRoles.length <= 1) return null;

  // Determine current active dashboard based on path
  const currentRole =
    availableRoles.find(
      r => pathname === r.path || pathname.startsWith(r.path + '/'),
    ) || availableRoles[0];

  return (
    <div className="px-3 pt-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted border border-border rounded-lg transition-colors outline-none focus:ring-2 focus:ring-primary/20">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <currentRole.icon className="w-4 h-4 text-muted-foreground" />
            {currentRole.label}
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          {availableRoles.map(role => (
            <DropdownMenuItem
              key={role.id}
              onClick={() => router.push(role.path)}
              className="flex items-center justify-between cursor-pointer py-2.5">
              <div className="flex items-center gap-2">
                <role.icon className="w-4 h-4 text-muted-foreground" />
                <span
                  className={currentRole.id === role.id ? 'font-medium' : ''}>
                  {role.label}
                </span>
              </div>
              {currentRole.id === role.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
