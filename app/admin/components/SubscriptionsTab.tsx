'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {useIsMobile} from '@/hooks/use-mobile';
import {fetchAdminSubscriptions} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Crown, Download, Loader2, Shield, UserCheck} from 'lucide-react';
import {useEffect} from 'react';
import {toast} from 'sonner';
import {handleExport} from './utils';

export function SubscriptionsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}) {
  const isMobile = useIsMobile();
  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-subscriptions', searchQuery],
    queryFn: ({pageParam = 0}) =>
      fetchAdminSubscriptions({search: searchQuery, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 0,
  });

  useEffect(() => {
    const errorPage = infiniteData?.pages.find(p => p.success === false);
    if (errorPage) toast.error(errorPage.error || 'Failed to load subcriptions');
  }, [infiniteData]);

  const subscriptions =
    infiniteData?.pages.flatMap(page => page.data || []) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading active subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {subscriptions.length} active subscribers loaded
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => handleExport('csv', 'subscriptions')}>
          <Download className="w-4 h-4 mr-1.5" /> Export
        </Button>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-2">
          {subscriptions.map((sub: any) => (
            <div
              key={sub.id}
              className={cn(
                'p-4 rounded-xl bg-card border border-border',
                'active:bg-muted/50 transition-colors',
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-hero/10 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-hero" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {sub.display_name || sub.username}
                      </p>
                      <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px]">
                        {sub.status || 'Active'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {sub.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-hero" />
                  <span className="font-medium text-foreground text-sm">
                    {sub.plan || 'Pro'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  Expires: {sub.expires || 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Auto-renew</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Expires</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub: any) => (
                <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-secondary" />
                      <div>
                        <p className="font-medium text-foreground">
                          {sub.display_name || sub.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-hero" />
                      <span className="font-medium text-foreground">
                        {sub.plan || 'Pro'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-500/10 text-emerald-500">
                      {sub.status || 'Active'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">Yes</td>
                  <td className="py-3 px-4 text-right font-mono text-foreground">
                    {sub.expires || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subscriptions.length === 0 && (
        <div className="text-center py-12">
          <Crown className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No subscribers found</p>
        </div>
      )}

      <InfiniteScroll
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </div>
  );
}
