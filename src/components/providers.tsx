'use client';

import {ThemeProvider} from '@/components/theme-provider';
import {Toaster} from '@/components/ui/sonner';
import {Toaster as DefaultToaster} from '@/components/ui/toaster';
import {TooltipProvider} from '@/components/ui/tooltip';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';
import {AuthSync} from './auth-sync';

export default function Providers({children}: {children: React.ReactNode}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange>
        <TooltipProvider>
          <AuthSync>{children}</AuthSync>
          <Toaster />
          <DefaultToaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
