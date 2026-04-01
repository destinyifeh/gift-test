'use client';

import {useState} from 'react';
import {toast} from 'sonner';

interface V2AdminModerationTabProps {
  addLog: (action: string) => void;
}

const mockReports = [
  {
    id: '1',
    type: 'campaign',
    reason: 'Inappropriate content',
    reporter: 'user123',
    target: 'Holiday Fundraiser',
    targetId: 'camp_123',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'user',
    reason: 'Spam behavior',
    reporter: 'user456',
    target: '@spammer_bot',
    targetId: 'user_456',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'gift',
    reason: 'Fraudulent activity',
    reporter: 'user789',
    target: 'Gift #12345',
    targetId: 'gift_789',
    status: 'resolved',
    created_at: new Date().toISOString(),
  },
];

export function V2AdminModerationTab({addLog}: V2AdminModerationTabProps) {
  const [reports, setReports] = useState(mockReports);

  const handleAction = (reportId: string, action: 'approve' | 'reject' | 'dismiss') => {
    setReports(prev =>
      prev.map(r =>
        r.id === reportId ? {...r, status: action === 'dismiss' ? 'dismissed' : 'resolved'} : r,
      ),
    );
    toast.success(`Report ${action === 'dismiss' ? 'dismissed' : 'resolved'}`);
    addLog(`Moderation: ${action} report #${reportId}`);
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const resolvedReports = reports.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Content Moderation
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
          Review flagged content and user reports.
        </p>
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
            This Week
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
            {pendingReports.map(report => (
              <div key={report.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        report.type === 'user'
                          ? 'bg-blue-100 text-blue-600'
                          : report.type === 'campaign'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-orange-100 text-orange-600'
                      }`}>
                      <span className="v2-icon">
                        {report.type === 'user'
                          ? 'person'
                          : report.type === 'campaign'
                            ? 'campaign'
                            : 'redeem'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold">{report.target}</p>
                      <p className="text-sm text-[var(--v2-on-surface-variant)]">{report.reason}</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">
                        Reported by @{report.reporter}
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
            {resolvedReports.map(report => (
              <div key={report.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container)] flex items-center justify-center">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)]">
                        check_circle
                      </span>
                    </div>
                    <div>
                      <p className="font-bold">{report.target}</p>
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
