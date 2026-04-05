'use client';

import {useState, useEffect} from 'react';
import {toast} from 'sonner';
import {fetchReports, updateReportStatus} from '@/lib/server/actions/moderation';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {V2ReportDetailsModal} from '../modals/V2ReportDetailsModal';

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

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  const handleViewDetails = (report: any) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[var(--v2-outline-variant)]/10">
          <div className="px-8 py-6 border-b border-[var(--v2-surface-container)] bg-[var(--v2-surface-container-low)]/30 flex items-center justify-between">
            <h4 className="v2-headline font-black text-xl tracking-tight">Active Reports</h4>
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[var(--v2-outline-variant)]/20 shadow-sm">
               {pendingReports.length} FLAGS
            </span>
          </div>
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {pendingReports.map((report: any) => (
              <div key={report.id} className="p-6 hover:bg-[var(--v2-surface-container-low)]/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                        report.target_type === 'user' ? 'bg-blue-100 text-blue-600' :
                        report.target_type === 'campaign' ? 'bg-purple-100 text-purple-600' :
                        report.target_type === 'vendor' ? 'bg-indigo-100 text-indigo-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                      <span className="v2-icon">
                        {report.target_type === 'user' ? 'person' :
                         report.target_type === 'campaign' ? 'campaign' :
                         report.target_type === 'vendor' ? 'storefront' : 'redeem'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-lg flex items-center gap-2">
                         {report.target_name || 'Item'} 
                         <span className="text-[10px] uppercase font-bold text-[var(--v2-on-surface-variant)]/40 tracking-[0.2em]">#{report.target_id?.slice(0, 8)}</span>
                      </p>
                      <p className="text-sm text-[var(--v2-on-surface-variant)] font-medium italic">"{report.reason}"</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] mt-2">
                        Reported by <span className="font-bold text-[var(--v2-on-surface)]">@{report.reporter_username || 'anonymous'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-16 md:ml-0">
                    <button
                      onClick={() => handleViewDetails(report)}
                      className="px-6 py-2.5 v2-btn-primary rounded-full text-xs font-black uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 transition-all">
                      View Details
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'dismiss')}
                      className="px-6 py-2.5 bg-white border border-[var(--v2-outline-variant)]/20 text-[var(--v2-on-surface-variant)] rounded-full text-xs font-black uppercase tracking-wider hover:bg-[var(--v2-surface-container)] transition-all">
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[var(--v2-outline-variant)]/10">
          <div className="px-8 py-5 border-b border-[var(--v2-surface-container)]">
            <h4 className="v2-headline font-bold text-lg">Resolution History</h4>
          </div>
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {resolvedReports.map((report: any) => (
              <div key={report.id} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container)] flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)]">
                      {report.status === 'dismissed' ? 'visibility_off' : 'check_circle'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{report.target_name || 'Report'}</p>
                    <p className="text-[10px] text-[var(--v2-on-surface-variant)] uppercase font-bold">{report.reason}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    report.status === 'dismissed' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {report.status}
                  </span>
                  {report.resolution_notes && (
                    <p className="text-[9px] text-[var(--v2-on-surface-variant)] mt-1.5 italic">
                      Note: {report.resolution_notes.slice(0, 40)}{report.resolution_notes.length > 40 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reports.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-[var(--v2-outline-variant)]/10">
          <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/10">shield</span>
          <p className="text-sm font-bold text-[var(--v2-on-surface-variant)]/50 mt-4 uppercase tracking-[0.2em]">Inbox Zero</p>
          <p className="text-xs text-[var(--v2-on-surface-variant)]/30 mt-1">No reports to review at this time.</p>
        </div>
      )}

      <V2ReportDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        report={selectedReport}
      />
    </div>
  );
}

