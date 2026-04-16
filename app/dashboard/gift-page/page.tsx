'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

export default function GiftPageRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=gift-page');
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
      <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
        progress_activity
      </span>
    </div>
  );
}
