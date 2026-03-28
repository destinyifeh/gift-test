'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useIsMobile} from '@/hooks/use-mobile';
import {fetchAdminTransactions} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useQuery} from '@tanstack/react-query';
import {ArrowDownRight, ArrowUpRight, Download, Eye, Loader2, MoreVertical, Receipt} from 'lucide-react';
import {useState} from 'react';
import {handleExport, statusBadge} from './utils';

interface TransactionsTabProps {
  searchQuery: string;
  setViewDetailsModal: (modal: any) => void;
}

export function TransactionsTab({
  searchQuery,
  setViewDetailsModal,
}: TransactionsTabProps) {
  const isMobile = useIsMobile();
  const {data, isLoading} = useQuery({
    queryKey: ['admin-transactions', searchQuery],
    queryFn: () => fetchAdminTransactions({search: searchQuery}),
  });

  const transactions = data?.data || [];
  const [txTypeFilter, setTxTypeFilter] = useState('all');

  const filteredTransactions = transactions.filter((t: any) => {
    const id = t.id || '';
    const senderStr = t.sender_profile?.username || '';
    const recipientStr = t.recipient_profile?.username || '';

    const matchesSearch =
      id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      senderStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipientStr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      txTypeFilter === 'all' || t.type?.toLowerCase() === txTypeFilter;

    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading ledger...</p>
      </div>
    );
  }

  const TransactionActions = ({t}: {t: any}) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            setViewDetailsModal({
              isOpen: true,
              title: 'Transaction Details',
              data: t,
            })
          }>
          <Eye className="w-4 h-4 mr-2" /> View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const getTypeIcon = (type: string) => {
    if (type === 'withdrawal') return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
    return <ArrowDownRight className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          {filteredTransactions.length} transactions
        </p>
        <div className="flex gap-2">
          <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
            <SelectTrigger className="w-32 md:w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="creator_support">Creator Support</SelectItem>
              <SelectItem value="campaign_contribution">Campaign</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => handleExport('csv', 'Transactions')}>
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-2">
          {filteredTransactions.map((t: any) => (
            <div
              key={t.id}
              className={cn(
                'p-4 rounded-xl bg-card border border-border',
                'active:bg-muted/50 transition-colors',
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    t.type === 'withdrawal' ? 'bg-rose-500/10' : 'bg-emerald-500/10',
                  )}>
                    {getTypeIcon(t.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm truncate">
                        {t.sender_profile?.username || 'Guest'}
                      </p>
                      <span className="text-muted-foreground">→</span>
                      <p className="font-medium text-foreground text-sm truncate">
                        {t.recipient_profile?.username || 'Bank'}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate capitalize">
                      {t.type?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <TransactionActions t={t} />
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={statusBadge(t.status) as any}
                    className="capitalize text-[10px]">
                    {t.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    #{t.id.split('-')[0]}
                  </span>
                </div>
                <p className="font-mono font-semibold text-foreground">
                  {t.currency || '₦'}{t.amount}
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
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">From</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">To</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t: any) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground" title={t.id}>
                    {t.id.split('-')[0]}...
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {t.type?.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    {t.sender_profile?.username || 'Guest'}
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    {t.recipient_profile?.username || 'Bank'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium">
                    {t.currency || '₦'}{t.amount}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusBadge(t.status) as any} className="capitalize">
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <TransactionActions t={t} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No transactions found</p>
        </div>
      )}
    </div>
  );
}
