'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Send, X } from 'lucide-react';
import api from '@/lib/api-client';

interface V2MessageVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
}

export function V2MessageVendorModal({
  isOpen,
  onClose,
  vendorId,
  vendorName
}: V2MessageVendorModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/vendor/${vendorId}/contact`, { message });
      toast.success(`Message sent to ${vendorName}!`);
      setMessage('');
      onClose();
    } catch (err: any) {
      console.error('Error sending message:', err);
      if (err.response?.status === 401) {
        toast.error('Please log in to message this vendor');
      } else {
        toast.error(err.response?.data?.message || 'Failed to send message');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--v2-surface-container)] transition-colors"
        >
          <X className="w-5 h-5 text-[var(--v2-on-surface-variant)]" />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-[var(--v2-primary)]/10 flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-[var(--v2-primary)]" />
          </div>
          <h3 className="text-2xl font-black v2-headline text-[var(--v2-on-surface)]">Write to {vendorName}</h3>
          <p className="text-sm text-[var(--v2-on-surface-variant)] font-medium mt-1">
            Send a direct message to this vendor
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-[var(--v2-on-surface-variant)] uppercase tracking-widest pl-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in..."
              className="w-full px-6 py-5 bg-[var(--v2-surface-container)] rounded-3xl border-none focus:ring-2 focus:ring-[var(--v2-primary)] outline-none text-sm min-h-[150px] resize-none font-medium text-[var(--v2-on-surface)]"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 v2-hero-gradient text-white rounded-2xl font-black text-sm shadow-xl shadow-[var(--v2-primary)]/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                SENDING...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                SEND MESSAGE
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
