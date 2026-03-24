'use client';

import {fetchAdminSubscriptions} from '@/lib/server/actions/admin';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Download, Mail, Shield, UserCheck} from 'lucide-react';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {Button} from '@/components/ui/button';
import {handleExport} from './utils';
import {useEffect} from 'react';
import {toast} from 'sonner';

export function SubscriptionsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}) {
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
      <div className="text-muted-foreground p-4">
        Loading active subscriptions...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {subscriptions.length} active subscribers loaded
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleExport('csv', 'subscriptions')}
        >
          <Download className="w-4 h-4 mr-1" /> Export List
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">User</th>
              <th className="text-left py-2 font-medium">Plan</th>
              <th className="text-left py-2 font-medium">Status</th>
              <th className="text-left py-2 font-medium">Auto-renew</th>
              <th className="text-right py-2 font-medium">Expires</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub: any) => (
              <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3">
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
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-hero" />
                    <span className="font-medium text-foreground">
                      {sub.plan || 'Pro'}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                    {sub.status || 'Active'}
                  </span>
                </td>
                <td className="py-3 text-muted-foreground">Yes</td>
                <td className="py-3 text-right font-mono text-foreground">
                  {sub.expires || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfiniteScroll
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </div>
  );
}
