'use client';

import {Button} from '@/components/ui/button';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {fetchCreatorSupporters} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {useUserStore} from '@/lib/store/useUserStore';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Gift, Loader2} from 'lucide-react';
import {DashboardEmptyState, DashboardListItem} from './shared';

interface CreatorGiftsTabProps {
  setSection: (section: any) => void;
  setWalletView: () => void;
}

export function CreatorGiftsTab({
  setSection,
  setWalletView,
}: CreatorGiftsTabProps) {
  const user = useUserStore(state => state.user);

  const {
    data: giftsRes,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['creator-gifts', user?.username],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) =>
      fetchCreatorSupporters({
        username: user?.username || '',
        pageParam,
      }),
    getNextPageParam: lastPage => (lastPage as any).nextPage,
    enabled: !!user?.username,
  });

  const giftsList = giftsRes?.pages.flatMap(p => (p as any).data || []) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading creator gifts...</p>
      </div>
    );
  }

  if (giftsList.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Gift className="w-8 h-8" />}
        title="No Creator Gifts Yet"
        description="When people send you gifts from your public page, they'll appear here."
        action={{label: 'Share Your Page', onClick: () => setSection('gift-page')}}
      />
    );
  }

  return (
    <div className="space-y-2">
      {giftsList.map((g: any) => (
        <DashboardListItem
          key={g.id}
          icon={<Gift className="w-5 h-5" />}
          iconBg="bg-secondary/10 text-secondary"
          title={g.giftName || 'Personal Support'}
          subtitle={`From: ${g.name} • ${g.date}${g.message ? ` • "${g.message}"` : ''}`}
          amount={formatCurrency(g.amount, g.currency)}
          badge={{label: 'Received', variant: 'secondary'}}
          trailing={
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                setSection('wallet');
                setWalletView();
              }}>
              Wallet
            </Button>
          }
        />
      ))}

      {!isLoading && giftsList.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}
    </div>
  );
}
