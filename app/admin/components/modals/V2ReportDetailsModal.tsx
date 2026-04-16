'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReportDetails, updateReportStatus } from '@/lib/server/actions/moderation';
import { updateUserSystemStatus, updateCampaignAdmin } from '@/lib/server/actions/admin';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';

interface V2ReportDetailsModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
}

export function V2ReportDetailsModal({ report, isOpen, onClose }: V2ReportDetailsModalProps) {
  const queryClient = useQueryClient();
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: detailsResult, isLoading } = useQuery({
    queryKey: ['report-details', report?.target_id, report?.target_type],
    queryFn: () => fetchReportDetails(report.target_id, report.target_type),
    enabled: !!report && !!isOpen,
  });

  const updateMutation = useMutation({
    mutationFn: (status: string) => updateReportStatus(report.id, status, resolutionNotes),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Report resolved');
        queryClient.invalidateQueries({ queryKey: ['admin-moderation-reports'] });
        onClose();
      } else {
        toast.error(res.error || 'Failed to update report');
      }
    },
  });

  const takeActionMutation = useMutation({
    mutationFn: async (action: 'ban' | 'suspend' | 'archive' | 'block') => {
      if (report.target_type === 'user' || report.target_type === 'vendor') {
        if (action === 'ban' || action === 'suspend') {
          return updateUserSystemStatus(report.target_id, {
            status: action === 'ban' ? 'banned' : 'suspended',
            suspension_end: action === 'suspend' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
          });
        }
      } else if (report.target_type === 'campaign') {
        if (action === 'archive' || action === 'block') {
          return updateCampaignAdmin(report.target_id, {
            status: action === 'block' ? 'blocked' : 'archived',
          });
        }
      }
      return { success: false, error: 'Invalid action' };
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success('System action applied');
        updateMutation.mutate('resolved');
      } else {
        toast.error(res.error || 'Action failed');
      }
    },
  });

  const details = detailsResult?.data;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent className="sm:max-w-[600px] p-0 overflow-hidden bg-[var(--v2-background)] border-none shadow-2xl rounded-3xl">
        <ResponsiveModalHeader className="px-8 pt-8 pb-6 bg-white border-b border-[var(--v2-outline-variant)]/10">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
              report?.target_type === 'user' ? 'bg-blue-100 text-blue-600' :
              report?.target_type === 'campaign' ? 'bg-purple-100 text-purple-600' :
              report?.target_type === 'vendor' ? 'bg-indigo-100 text-indigo-600' :
              'bg-orange-100 text-orange-600'
            }`}>
              <span className="v2-icon">
                {report?.target_type === 'user' ? 'person' :
                  report?.target_type === 'campaign' ? 'campaign' :
                  report?.target_type === 'vendor' ? 'storefront' : 'redeem'}
              </span>
            </div>
            <div>
              <ResponsiveModalTitle className="text-2xl font-black v2-headline">
                Report Details
              </ResponsiveModalTitle>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Viewing report #{report?.id?.slice(0, 8)}
              </p>
            </div>
          </div>
        </ResponsiveModalHeader>

        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto space-y-8 v2-no-scrollbar">
          {/* Reporter Section */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)]">
              Reported By
            </h4>
            <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-[var(--v2-outline-variant)]/10">
               <div>
                  <p className="font-bold text-[var(--v2-on-surface)]">@{report?.reporter_username || 'anonymous'}</p>
                  <p className="text-xs text-[var(--v2-on-surface-variant)] mt-0.5">
                    Filed on {report?.created_at ? format(new Date(report.created_at), 'PPPp') : 'Unknown date'}
                  </p>
               </div>
               <span className="px-3 py-1 bg-[var(--v2-error)]/10 text-[var(--v2-error)] text-[10px] font-bold rounded-full uppercase">
                 Pending review
               </span>
            </div>
          </section>

          {/* Reason Section */}
          <section className="space-y-3">
             <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)]">
              Reason for Report
            </h4>
            <div className="bg-[var(--v2-error)]/5 p-4 rounded-2xl border border-[var(--v2-error)]/10">
               <p className="text-[var(--v2-on-surface)] font-medium italic">"{report?.reason}"</p>
            </div>
          </section>

          {/* Target Object Section */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)]">
              Target Item Information
            </h4>
            {isLoading ? (
              <div className="flex items-center justify-center p-8 bg-white rounded-2xl">
                 <span className="v2-icon animate-spin text-[var(--v2-primary)]">progress_activity</span>
              </div>
            ) : details ? (
              <div className="bg-white p-6 rounded-2xl space-y-4 border border-[var(--v2-outline-variant)]/10">
                <div className="flex items-center gap-4">
                   {details.image_url || details.avatar_url ? (
                      <img 
                        src={details.image_url || details.avatar_url} 
                        className="w-16 h-16 rounded-xl object-cover ring-2 ring-white shadow-sm"
                        alt="Target"
                      />
                   ) : (
                      <div className="w-16 h-16 rounded-xl bg-[var(--v2-surface-container)] flex items-center justify-center">
                        <span className="v2-icon text-2xl text-[var(--v2-on-surface-variant)]">
                           {report.target_type === 'user' ? 'person' : 'image'}
                        </span>
                      </div>
                   )}
                   <div>
                      <p className="text-lg font-black v2-headline">{details.title || details.display_name || details.username || report.target_name}</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Type: <span className="capitalize">{report.target_type}</span></p>
                      <p className="text-[10px] font-mono text-[var(--v2-on-surface-variant)]">ID: {report.target_id}</p>
                   </div>
                </div>

                {report.target_type === 'campaign' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-[var(--v2-surface-container-low)] p-3 rounded-xl text-center">
                       <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase">Raised</p>
                       <p className="font-bold">{formatCurrency(details.current_amount || 0, details.currency || 'NGN')}</p>
                    </div>
                    <div className="bg-[var(--v2-surface-container-low)] p-3 rounded-xl text-center">
                       <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase">Status</p>
                       <p className="font-bold capitalize">{details.status}</p>
                    </div>
                  </div>
                )}

                {report.target_type === 'user' && (
                   <div className="pt-2">
                      <p className="text-sm text-[var(--v2-on-surface-variant)] mb-2">{details.description || 'No biography provided.'}</p>
                      <div className="bg-[var(--v2-surface-container-low)] p-3 rounded-xl flex items-center justify-between">
                         <span className="text-xs font-bold text-[var(--v2-on-surface-variant)]">Current Status</span>
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${details.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {details.status}
                         </span>
                      </div>
                   </div>
                )}
              </div>
            ) : (
              <div className="p-8 bg-white rounded-2xl text-center text-[var(--v2-error)] border border-[var(--v2-error)]/20">
                 <p className="text-sm font-bold">Target item could not be retrieved.</p>
                 <p className="text-xs mt-1">Is it possible the item was already deleted?</p>
              </div>
            )}
          </section>

          {/* Action Form */}
          <section className="space-y-3 pt-4 border-t border-[var(--v2-outline-variant)]/10">
             <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--v2-on-surface-variant)]">
              Resolution Action
            </h4>
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] mb-1.5 block ml-1 uppercase tracking-tight">Admin Resolution Notes</label>
                  <textarea 
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter notes about this resolution..."
                    className="w-full min-h-[100px] p-4 bg-white rounded-2xl border border-[var(--v2-outline-variant)]/20 focus:ring-2 focus:ring-[var(--v2-primary)] outline-none text-sm shadow-sm transition-all"
                  />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => updateMutation.mutate('dismissed')}
                    disabled={updateMutation.isPending}
                    className="py-4 bg-white border border-[var(--v2-outline-variant)]/20 text-[var(--v2-on-surface)] rounded-2xl font-bold text-sm hover:bg-[var(--v2-surface-container)] transition-all shadow-sm"
                  >
                    Dismiss Report
                  </button>
                  <button 
                    onClick={() => updateMutation.mutate('resolved')}
                    disabled={updateMutation.isPending}
                    className="py-4 v2-gradient-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-[var(--v2-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Mark as Resolved
                  </button>
               </div>

               {/* Hard Penalties */}
               {details && (
                 <div className="pt-4 space-y-3">
                    <p className="text-[10px] font-black text-[var(--v2-error)] uppercase tracking-widest text-center">System-wide Penalties</p>
                    <div className="grid grid-cols-2 gap-3">
                       {report.target_type === 'user' || report.target_type === 'vendor' ? (
                          <>
                            <button 
                              onClick={() => takeActionMutation.mutate('suspend')}
                              className="py-4 bg-orange-100 text-orange-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-orange-200 transition-all border border-orange-200/50"
                            >
                              Suspend (7 Days)
                            </button>
                            <button 
                              onClick={() => takeActionMutation.mutate('ban')}
                              className="py-4 bg-red-100 text-red-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-red-200 transition-all border border-red-200/50"
                            >
                              Ban User Forever
                            </button>
                          </>
                       ) : report.target_type === 'campaign' ? (
                          <>
                             <button 
                              onClick={() => takeActionMutation.mutate('archive')}
                              className="py-4 bg-orange-100 text-orange-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-orange-200 transition-all"
                            >
                              Archive Campaign
                            </button>
                            <button 
                              onClick={() => takeActionMutation.mutate('block')}
                              className="py-4 bg-red-100 text-red-700 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-red-200 transition-all"
                            >
                              Block Campaign
                            </button>
                          </>
                       ) : null}
                    </div>
                 </div>
               )}
            </div>
          </section>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
