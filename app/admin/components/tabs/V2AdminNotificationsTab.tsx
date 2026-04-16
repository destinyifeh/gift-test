'use client';

import {useIsMobile} from '@/hooks/use-mobile';
import {useState} from 'react';
import {toast} from 'sonner';

type NotificationType = 'push' | 'email' | 'both';
type BroadcastType = 'push' | 'email';

interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  body: string;
  status: 'active' | 'draft';
  createdAt: string;
  updatedAt: string;
}

const initialTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    type: 'email',
    subject: 'Welcome to Gifthance!',
    body: 'Hi {{name}}, welcome to Gifthance! We are excited to have you on board.',
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Gift Received',
    type: 'push',
    subject: 'You received a gift!',
    body: '{{sender}} just sent you a {{giftName}}!',
    status: 'active',
    createdAt: '2024-01-10',
    updatedAt: '2024-02-01',
  },
  {
    id: '3',
    name: 'Campaign Milestone',
    type: 'both',
    subject: 'Congratulations on your milestone!',
    body: 'Your campaign "{{campaignName}}" has reached {{milestone}}% of its goal!',
    status: 'active',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-25',
  },
  {
    id: '4',
    name: 'Withdrawal Approved',
    type: 'email',
    subject: 'Your withdrawal has been approved',
    body: 'Your withdrawal request of {{amount}} has been approved and is being processed.',
    status: 'draft',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
];

const TARGET_OPTIONS = [
  {value: 'all', label: 'All Users'},
  {value: 'creators', label: 'Creators Only'},
  {value: 'vendors', label: 'Vendors Only'},
  {value: 'pro', label: 'Pro Subscribers'},
  {value: 'inactive', label: 'Inactive Users (30+ days)'},
];

export function V2AdminNotificationsTab() {
  const isMobile = useIsMobile();

  // Tab state
  const [activeTab, setActiveTab] = useState<'broadcast' | 'templates'>('broadcast');

  // Broadcast state
  const [broadcastType, setBroadcastType] = useState<BroadcastType>('push');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Template state
  const [templates, setTemplates] = useState<NotificationTemplate[]>(initialTemplates);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'email' as NotificationType,
    subject: '',
    body: '',
    status: 'draft' as 'active' | 'draft',
  });

  // Recent broadcasts history
  const [recentBroadcasts, setRecentBroadcasts] = useState<
    {id: string; type: BroadcastType; title: string; target: string; sentAt: string; recipients: number}[]
  >([]);

  // Mobile action sheet
  const [mobileActionSheet, setMobileActionSheet] = useState<{isOpen: boolean; template: NotificationTemplate | null}>({
    isOpen: false,
    template: null,
  });

  const handleSelectTemplate = (template: NotificationTemplate) => {
    setSelectedTemplateId(template.id);
    setBroadcastTitle(template.subject);
    setBroadcastMessage(template.body);
    if (template.type === 'email') {
      setBroadcastType('email');
    } else if (template.type === 'push') {
      setBroadcastType('push');
    }
    toast.success(`Template "${template.name}" loaded`);
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!broadcastMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    const recipientCount = Math.floor(Math.random() * 5000) + 500;
    const newBroadcast = {
      id: Date.now().toString(),
      type: broadcastType,
      title: broadcastTitle,
      target: TARGET_OPTIONS.find(t => t.value === broadcastTarget)?.label || broadcastTarget,
      sentAt: new Date().toISOString(),
      recipients: recipientCount,
    };

    setRecentBroadcasts(prev => [newBroadcast, ...prev]);
    toast.success(`${broadcastType === 'push' ? 'Push notification' : 'Email'} sent to ${recipientCount} users`);

    setBroadcastTitle('');
    setBroadcastMessage('');
    setSelectedTemplateId(null);
    setIsSending(false);
  };

  const openNewTemplateModal = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      type: 'email',
      subject: '',
      body: '',
      status: 'draft',
    });
    setShowTemplateModal(true);
  };

  const openEditTemplateModal = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      status: template.status,
    });
    setShowTemplateModal(true);
    setMobileActionSheet({isOpen: false, template: null});
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (!templateForm.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!templateForm.body.trim()) {
      toast.error('Please enter a message body');
      return;
    }

    if (editingTemplate) {
      // Update existing
      setTemplates(prev =>
        prev.map(t =>
          t.id === editingTemplate.id
            ? {...t, ...templateForm, updatedAt: new Date().toISOString().split('T')[0]}
            : t
        )
      );
      toast.success('Template updated');
    } else {
      // Add new
      const newTemplate: NotificationTemplate = {
        id: Date.now().toString(),
        ...templateForm,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setTemplates(prev => [newTemplate, ...prev]);
      toast.success('Template created');
    }

    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (template: NotificationTemplate) => {
    setTemplates(prev => prev.filter(t => t.id !== template.id));
    toast.success('Template deleted');
    setMobileActionSheet({isOpen: false, template: null});
  };

  const handleDuplicateTemplate = (template: NotificationTemplate) => {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTemplates(prev => [newTemplate, ...prev]);
    toast.success('Template duplicated');
    setMobileActionSheet({isOpen: false, template: null});
  };

  const toggleTemplateStatus = (template: NotificationTemplate) => {
    setTemplates(prev =>
      prev.map(t =>
        t.id === template.id
          ? {...t, status: t.status === 'active' ? 'draft' : 'active', updatedAt: new Date().toISOString().split('T')[0]}
          : t
      )
    );
    toast.success(`Template ${template.status === 'active' ? 'deactivated' : 'activated'}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Notifications
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
          Send push notifications, email broadcasts, and manage templates.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-[var(--v2-surface-container)] rounded-full w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('broadcast')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
            activeTab === 'broadcast'
              ? 'bg-white text-[var(--v2-on-surface)] shadow-sm'
              : 'text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)]'
          }`}
        >
          <span className="v2-icon text-lg mr-2 align-middle">send</span>
          Broadcast
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
            activeTab === 'templates'
              ? 'bg-white text-[var(--v2-on-surface)] shadow-sm'
              : 'text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)]'
          }`}
        >
          <span className="v2-icon text-lg mr-2 align-middle">description</span>
          Templates
        </button>
      </div>

      {activeTab === 'broadcast' ? (
        <>
          {/* Broadcast Type Toggle */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setBroadcastType('push')}
              className={`flex-1 md:flex-none flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all ${
                broadcastType === 'push'
                  ? 'border-[var(--v2-primary)] bg-[var(--v2-primary-container)]/10'
                  : 'border-[var(--v2-surface-container-high)] bg-white hover:border-[var(--v2-outline-variant)]'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                broadcastType === 'push' ? 'bg-[var(--v2-primary)] text-white' : 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
              }`}>
                <span className="v2-icon text-2xl">notifications_active</span>
              </div>
              <div className="text-left">
                <p className="font-bold">Push Notification</p>
                <p className="text-xs text-[var(--v2-on-surface-variant)]">Send to mobile & web</p>
              </div>
              {broadcastType === 'push' && (
                <span className="v2-icon text-[var(--v2-primary)] ml-auto">check_circle</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setBroadcastType('email')}
              className={`flex-1 md:flex-none flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all ${
                broadcastType === 'email'
                  ? 'border-[var(--v2-primary)] bg-[var(--v2-primary-container)]/10'
                  : 'border-[var(--v2-surface-container-high)] bg-white hover:border-[var(--v2-outline-variant)]'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                broadcastType === 'email' ? 'bg-[var(--v2-primary)] text-white' : 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
              }`}>
                <span className="v2-icon text-2xl">email</span>
              </div>
              <div className="text-left">
                <p className="font-bold">Email Broadcast</p>
                <p className="text-xs text-[var(--v2-on-surface-variant)]">Send to user inboxes</p>
              </div>
              {broadcastType === 'email' && (
                <span className="v2-icon text-[var(--v2-primary)] ml-auto">check_circle</span>
              )}
            </button>
          </div>

          {/* Broadcast Form */}
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--v2-primary-container)] text-white">
            <div className="flex items-center gap-3 mb-6">
              <span className="v2-icon text-3xl">
                {broadcastType === 'push' ? 'notifications_active' : 'email'}
              </span>
              <div>
                <h4 className="v2-headline font-bold text-lg">
                  {broadcastType === 'push' ? 'Push Notification' : 'Email Broadcast'}
                </h4>
                <p className="text-white/70 text-sm">
                  {broadcastType === 'push'
                    ? 'Send instant notifications to user devices'
                    : 'Send emails to user inboxes'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Template Selector */}
              <div>
                <label className="text-sm font-bold text-white/80 block mb-2">
                  Use Template (Optional)
                </label>
                <select
                  value={selectedTemplateId || ''}
                  onChange={e => {
                    const template = templates.find(t => t.id === e.target.value);
                    if (template) handleSelectTemplate(template);
                    else setSelectedTemplateId(null);
                  }}
                  className="w-full bg-white/20 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-white/30"
                >
                  <option value="" className="text-gray-900">Select a template...</option>
                  {templates
                    .filter(t => t.status === 'active' && (t.type === broadcastType || t.type === 'both'))
                    .map(t => (
                      <option key={t.id} value={t.id} className="text-gray-900">
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="text-sm font-bold text-white/80 block mb-2">
                  Target Audience
                </label>
                <select
                  value={broadcastTarget}
                  onChange={e => setBroadcastTarget(e.target.value)}
                  className="w-full bg-white/20 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-white/30"
                >
                  {TARGET_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="text-gray-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-bold text-white/80 block mb-2">
                  {broadcastType === 'push' ? 'Title' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  placeholder={broadcastType === 'push' ? 'Notification title...' : 'Email subject...'}
                  className="w-full bg-white/20 border-none rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-white/30"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="text-sm font-bold text-white/80 block mb-2">
                  Message
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={broadcastType === 'email' ? 6 : 3}
                  className="w-full bg-white/20 border-none rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 resize-none"
                />
                <p className="text-xs text-white/50 mt-2">
                  Use {'{{name}}'}, {'{{email}}'} for personalization
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={isSending}
                className="w-full md:w-auto px-8 py-3 bg-white text-[var(--v2-primary)] rounded-full font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <span className="v2-icon text-lg animate-spin">progress_activity</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="v2-icon text-lg">send</span>
                    Send {broadcastType === 'push' ? 'Notification' : 'Email'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent Broadcasts */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 md:px-8 py-6 border-b border-[var(--v2-surface-container)]">
              <h4 className="v2-headline font-bold text-lg">Recent Broadcasts</h4>
            </div>
            {recentBroadcasts.length === 0 ? (
              <div className="p-8 text-center">
                <span className="v2-icon text-5xl text-[var(--v2-on-surface-variant)]/20">
                  campaign
                </span>
                <p className="text-sm text-[var(--v2-on-surface-variant)] mt-4">
                  No broadcasts sent yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--v2-surface-container)]">
                {recentBroadcasts.map(broadcast => (
                  <div key={broadcast.id} className="px-6 md:px-8 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]">
                      <span className="v2-icon">
                        {broadcast.type === 'push' ? 'notifications' : 'email'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{broadcast.title}</p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                        Sent to {broadcast.target} • {broadcast.recipients.toLocaleString()} recipients
                      </p>
                    </div>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      {new Date(broadcast.sentAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Templates Header */}
          <div className="flex items-center justify-between">
            <p className="text-[var(--v2-on-surface-variant)]">
              {templates.length} template{templates.length !== 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={openNewTemplateModal}
              className="flex items-center gap-2 px-6 py-2.5 v2-hero-gradient text-white rounded-full font-bold text-sm shadow-lg shadow-[var(--v2-primary)]/20"
            >
              <span className="v2-icon text-lg">add</span>
              New Template
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    template.type === 'email'
                      ? 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
                      : template.type === 'push'
                        ? 'bg-[var(--v2-secondary-container)]/20 text-[var(--v2-secondary)]'
                        : 'bg-[var(--v2-tertiary-container)]/20 text-[var(--v2-tertiary)]'
                  }`}>
                    <span className="v2-icon text-2xl">
                      {template.type === 'email'
                        ? 'email'
                        : template.type === 'push'
                          ? 'notifications'
                          : 'campaign'}
                    </span>
                  </div>
                  {isMobile ? (
                    <button
                      type="button"
                      onClick={() => setMobileActionSheet({isOpen: true, template})}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--v2-surface-container)]"
                    >
                      <span className="v2-icon">more_vert</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate(template)}
                        className="p-2 rounded-lg hover:bg-[var(--v2-surface-container)] transition-colors"
                        title="Use template"
                      >
                        <span className="v2-icon text-[var(--v2-primary)]">play_arrow</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditTemplateModal(template)}
                        className="p-2 rounded-lg hover:bg-[var(--v2-surface-container)] transition-colors"
                        title="Edit template"
                      >
                        <span className="v2-icon text-[var(--v2-on-surface-variant)]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateTemplate(template)}
                        className="p-2 rounded-lg hover:bg-[var(--v2-surface-container)] transition-colors"
                        title="Duplicate template"
                      >
                        <span className="v2-icon text-[var(--v2-on-surface-variant)]">content_copy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(template)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete template"
                      >
                        <span className="v2-icon text-red-500">delete</span>
                      </button>
                    </div>
                  )}
                </div>

                <h5 className="font-bold text-lg mb-1">{template.name}</h5>
                <p className="text-sm text-[var(--v2-on-surface-variant)] mb-3 line-clamp-2">
                  {template.subject}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      template.type === 'email'
                        ? 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'
                        : template.type === 'push'
                          ? 'bg-[var(--v2-secondary-container)]/20 text-[var(--v2-secondary)]'
                          : 'bg-[var(--v2-tertiary-container)]/20 text-[var(--v2-tertiary)]'
                    }`}>
                      {template.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      template.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleTemplateStatus(template)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      template.status === 'active' ? 'bg-[var(--v2-primary)]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        template.status === 'active' ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{zIndex: 10000}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTemplateModal(false)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold v2-headline">
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </h3>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <span className="v2-icon">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={e => setTemplateForm({...templateForm, name: e.target.value})}
                  placeholder="e.g., Welcome Email"
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Type
                </label>
                <div className="flex gap-2">
                  {(['email', 'push', 'both'] as NotificationType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTemplateForm({...templateForm, type})}
                      className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                        templateForm.type === type
                          ? 'bg-[var(--v2-primary)] text-white'
                          : 'bg-[var(--v2-surface-container)] text-[var(--v2-on-surface)]'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Subject / Title
                </label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={e => setTemplateForm({...templateForm, subject: e.target.value})}
                  placeholder="Notification subject or title"
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Message Body
                </label>
                <textarea
                  value={templateForm.body}
                  onChange={e => setTemplateForm({...templateForm, body: e.target.value})}
                  placeholder="Enter your message template..."
                  rows={5}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none resize-none"
                />
                <p className="text-xs text-[var(--v2-on-surface-variant)] mt-2">
                  Available variables: {'{{name}}'}, {'{{email}}'}, {'{{amount}}'}, {'{{giftName}}'}, {'{{campaignName}}'}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--v2-on-surface)] block mb-2">
                  Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplateForm({...templateForm, status: 'draft'})}
                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                      templateForm.status === 'draft'
                        ? 'bg-gray-600 text-white'
                        : 'bg-[var(--v2-surface-container)] text-[var(--v2-on-surface)]'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateForm({...templateForm, status: 'active'})}
                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                      templateForm.status === 'active'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[var(--v2-surface-container)] text-[var(--v2-on-surface)]'
                    }`}
                  >
                    Active
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 py-3 bg-[var(--v2-surface-container)] rounded-full font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="flex-1 py-3 v2-hero-gradient text-white rounded-full font-bold"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Action Sheet */}
      {mobileActionSheet.isOpen && mobileActionSheet.template && (
        <div className="fixed inset-0 md:hidden" style={{zIndex: 10000}}>
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileActionSheet({isOpen: false, template: null})}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-4 border-b border-gray-100">
              <p className="font-bold text-lg">{mobileActionSheet.template.name}</p>
              <p className="text-sm text-gray-500">{mobileActionSheet.template.type} template</p>
            </div>

            <div className="p-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  handleSelectTemplate(mobileActionSheet.template!);
                  setMobileActionSheet({isOpen: false, template: null});
                  setActiveTab('broadcast');
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                  <span className="v2-icon text-[var(--v2-primary)]">play_arrow</span>
                </div>
                <span className="font-medium">Use Template</span>
              </button>

              <button
                type="button"
                onClick={() => openEditTemplateModal(mobileActionSheet.template!)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                  <span className="v2-icon text-[var(--v2-primary)]">edit</span>
                </div>
                <span className="font-medium">Edit Template</span>
              </button>

              <button
                type="button"
                onClick={() => handleDuplicateTemplate(mobileActionSheet.template!)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--v2-secondary-container)]/20 flex items-center justify-center">
                  <span className="v2-icon text-[var(--v2-secondary)]">content_copy</span>
                </div>
                <span className="font-medium">Duplicate</span>
              </button>

              <button
                type="button"
                onClick={() => toggleTemplateStatus(mobileActionSheet.template!)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  mobileActionSheet.template.status === 'active'
                    ? 'bg-[var(--v2-surface-container)]'
                    : 'bg-emerald-100'
                }`}>
                  <span className={`v2-icon ${
                    mobileActionSheet.template.status === 'active'
                      ? 'text-[var(--v2-on-surface-variant)]'
                      : 'text-emerald-600'
                  }`}>
                    {mobileActionSheet.template.status === 'active' ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
                <span className="font-medium">
                  {mobileActionSheet.template.status === 'active' ? 'Deactivate' : 'Activate'}
                </span>
              </button>

              <div className="h-px bg-[var(--v2-surface-container)] my-2" />

              <button
                type="button"
                onClick={() => handleDeleteTemplate(mobileActionSheet.template!)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--v2-error)]/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--v2-error)]/10 flex items-center justify-center">
                  <span className="v2-icon text-[var(--v2-error)]">delete</span>
                </div>
                <span className="font-medium text-[var(--v2-error)]">Delete Template</span>
              </button>
            </div>

            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={() => setMobileActionSheet({isOpen: false, template: null})}
                className="w-full py-4 bg-[var(--v2-surface-container)] rounded-2xl font-bold text-[var(--v2-on-surface-variant)]"
              >
                Cancel
              </button>
            </div>
            <div className="h-8" />
          </div>
        </div>
      )}
    </div>
  );
}
