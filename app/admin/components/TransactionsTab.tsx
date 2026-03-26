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
import {fetchAdminTransactions} from '@/lib/server/actions/admin';
import {useQuery} from '@tanstack/react-query';
import {Download, Eye, MoreVertical} from 'lucide-react';
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
    return <div className="text-muted-foreground p-4">Loading ledger...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-muted-foreground">
          {filteredTransactions.length} transactions
        </p>
        <div className="flex gap-2">
          <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="creator_support">Creator Support</SelectItem>
              <SelectItem value="campaign_contribution">
                Campaign Contribution
              </SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleExport('csv', 'Transactions')}>
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">ID (Short)</th>
              <th className="text-left py-2 font-medium">Type</th>
              <th className="text-left py-2 font-medium">From User/Card</th>
              <th className="text-left py-2 font-medium">To User/Bank</th>
              <th className="text-right py-2 font-medium">Amount</th>
              <th className="text-right py-2 font-medium pr-6">Currency</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t: any) => (
              <tr
                key={t.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td
                  className="py-3 font-mono text-xs text-muted-foreground"
                  title={t.id}>
                  {t.id.split('-')[0]}...
                </td>
                <td className="py-3">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase truncate max-w-[120px]">
                    {t.type}
                  </Badge>
                </td>
                <td className="py-3 text-foreground">
                  {t.sender_profile?.username || 'Guest'}
                </td>
                <td className="py-3 text-foreground">
                  {t.recipient_profile?.username || 'Platform/Bank'}
                </td>
                <td className="py-3 text-right text-foreground font-mono font-medium">
                  {t.amount}
                </td>
                <td className="py-3 text-right text-muted-foreground pr-6 font-mono">
                  {t.currency || 'USD'}
                </td>
                <td className="py-3 pl-6">
                  <Badge
                    variant={statusBadge(t.status) as any}
                    className="capitalize">
                    {t.status}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
