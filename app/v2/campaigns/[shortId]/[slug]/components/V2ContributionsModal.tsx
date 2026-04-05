import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {formatCurrency} from '@/lib/utils/currency';
import {formatDistanceToNow} from 'date-fns';
import {Contribution} from './CampaignContributions';
import {VisuallyHidden} from '@/components/ui/visually-hidden';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';

interface V2ContributionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contributions: Contribution[];
  currency: string;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

function getTimeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), {addSuffix: true});
  } catch {
    return 'Recently';
  }
}

export function V2ContributionsModal({
  open,
  onOpenChange,
  contributions,
  currency,
  hasMore,
  isLoading,
  onLoadMore,
}: V2ContributionsModalProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl bg-[var(--v2-surface)] max-h-[85vh] flex flex-col">
        <VisuallyHidden>
            <ResponsiveModalTitle>All Contributions</ResponsiveModalTitle>
        </VisuallyHidden>
        <ResponsiveModalHeader className="px-6 pt-8 pb-4 border-b border-[var(--v2-outline-variant)]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center text-[var(--v2-primary)]">
              <span className="v2-icon">volunteer_activism</span>
            </div>
            <div>
              <h2 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
                All Contributions
              </h2>
              <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                {contributions.length} People Supported
              </p>
            </div>
          </div>
        </ResponsiveModalHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 v2-no-scrollbar">
          {contributions.map((contribution) => {
            const name = contribution.is_anonymous
              ? 'Anonymous'
              : contribution.donor_name ||
                contribution.profiles?.display_name ||
                'Supporter';
            const avatarUrl = contribution.is_anonymous
              ? null
              : contribution.profiles?.avatar_url;

            return (
              <div
                key={contribution.id}
                className="flex items-center justify-between p-4 bg-[var(--v2-surface-container-low)] rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--v2-surface-container-high)] flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span
                        className="v2-icon text-[var(--v2-on-surface-variant)]"
                        style={contribution.is_anonymous ? {fontVariationSettings: "'FILL' 1"} : undefined}
                      >
                        person
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--v2-on-surface)]">{name}</p>
                    <p className="text-[10px] text-[var(--v2-on-surface-variant)] uppercase font-bold tracking-tighter">
                      {getTimeAgo(contribution.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg v2-headline font-black text-[var(--v2-primary)]">
                    {formatCurrency(contribution.amount, currency)}
                  </p>
                  <p className="text-[10px] text-[var(--v2-on-surface-variant)] font-bold uppercase tracking-widest leading-none">
                    Gifted
                  </p>
                </div>
              </div>
            );
          })}

          <InfiniteScroll
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={onLoadMore}
          />
        </div>

        <div className="p-4 bg-[var(--v2-surface-container)]/30 border-t border-[var(--v2-outline-variant)]/10 text-center">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-4 text-sm font-bold text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors"
          >
            Close Window
          </button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
