'use client';

import {Loader2} from 'lucide-react';
import {useEffect} from 'react';
import {useInView} from 'react-intersection-observer';

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
}: InfiniteScrollProps) {
  const {ref, inView} = useInView({
    // Increased root margin so it triggers loading slightly before the user reaches the absolute bottom
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div ref={ref} className="flex justify-center w-full py-6">
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      ) : (
        <div className="h-6" /> /* Spacer if not actively loading but in-view triggered */
      )}
    </div>
  );
}
