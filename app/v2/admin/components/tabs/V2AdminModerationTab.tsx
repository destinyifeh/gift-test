'use client';

import {useState, useEffect} from 'react';
import {toast} from 'sonner';
import {fetchReports, updateReportStatus} from '@/lib/server/actions/moderation';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

interface V2AdminModerationTabProps {
  addLog: (action: string) => void;
}

export function V2AdminModerationTab({addLog}: V2AdminModerationTabProps) {
  const queryClient = useQueryClient();

  const {data: reportResult, isLoading, refetch} = useQuery({
    queryKey: ['admin-moderation-reports'],
    queryFn: () => fetchReports(),
  });

  const updateMutation = useMutation({
    mutationFn: ({id, status}: {id: string, status: string}) => updateReportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin-moderation-reports']});
    }
  });

  const reports = reportResult?.data || [];

  const handleAction = async (reportId: string, action: 'approve' | 'reject' | 'dismiss') => {
    const status = action === 'dismiss' ? 'dismissed' : 'resolved';
    
    try {
      await updateMutation.mutateAsync({id: reportId, status});
      toast.success(`Report ${action === 'dismiss' ? 'dismissed' : 'resolved'}`);
      addLog(`Moderation: ${action} report #${reportId}`);
    } catch (err: any) {
      toast.error('Failed to update report');
    }
  };

  const pendingReports = reports.filter((r: any) => r.status === 'pending');
  const resolvedReports = reports.filter((r: any) => r.status !== 'pending');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
            Content Moderation
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
            Review flagged content and user reports.
          </p>
        </div>
        <button 
           onClick={() => refetch()}
           className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)] transition-colors"
        >
           <span className="v2-icon">refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--v2-error)]/10 p-6 rounded-xl">
          <p className="text-xs font-bold text-[var(--v2-error)] uppercase tracking-wider">
            Pending Review
          </p>
          <p className="text-3xl font-black v2-headline mt-2">{pendingReports.length}</p>
        </div>
        <div className="bg-emerald-100 p-6 rounded-xl">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolved</p>
          <p className="text-3xl font-black v2-headline mt-2">{resolvedReports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Total Reports
          </p>
          <p className="text-3xl font-black v2-headline mt-2">{reports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
            Avg. Resolution
          </p>
          <p className="text-3xl font-black v2-headline mt-2">2.4h</p>
        </div>
      </div>

      {/* Pending Reports */}
      {pendingReports.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-[var(--v2-surface-container)]">
            <h4 className="v2-headline font-bold text-lg">Pending Reports</h4>
          </div>
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {pendingReports.map((report: any) => (
              <div key={report.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        report.target_type === 'user'
                          ? 'bg-blue-100 text-blue-600'
                          : report.target_type === 'campaign'
                            ? 'bg-purple-100 text-purple-600'
                            : report.target_type === 'vendor'
                               ? 'bg-indigo-100 text-indigo-600'
                               : 'bg-orange-100 text-orange-600'
                      }`}>
                      <span className="v2-icon">
                        {report.target_type === 'user'
                          ? 'person'
                          : report.target_type === 'campaign'
                            ? 'campaign'
                            : report.target_type === 'vendor'
                               ? 'storefront'
                               : 'redeem'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold flex items-center gap-2">
                         {report.target_name || 'Item'} 
                         <span className="text-[10px] uppercase font-bold text-[var(--v2-on-surface-variant)]/50 tracking-widest">#{report.target_id?.slice(0, 6)}</span>
                      </p>
                      <p className="text-sm text-[var(--v2-on-surface-variant)]">{report.reason}</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">
                        Reported by @{report.reporter_username || 'anonymous'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-16 md:ml-0">
                    <button
                      onClick={() => handleAction(report.id, 'approve')}
                      className="px-4 py-2 bg-[var(--v2-error)]/10 text-[var(--v2-error)] rounded-full text-sm font-bold hover:bg-[var(--v2-error)]/20">
                      Take Action
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'dismiss')}
                      className="px-4 py-2 bg-[var(--v2-surface-container)] text-[var(--v2-on-surface-variant)] rounded-full text-sm font-bold hover:bg-[var(--v2-surface-container-high)]">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-[var(--v2-surface-container)]">
            <h4 className="v2-headline font-bold text-lg">Resolved</h4>
          </div>
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {resolvedReports.map((report: any) => (
              <div key={report.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container)] flex items-center justify-center">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)]">
                        check_circle
                      </span>
                    </div>
                    <div>
                      <p className="font-bold">{report.target_name || 'Report'}</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">{report.reason}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reports.length === 0 && (
        <div className="text-center py-16">
          <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20">shield</span>
          <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">No reports to review</p>
        </div>
      )}
    </div>
  );
}

