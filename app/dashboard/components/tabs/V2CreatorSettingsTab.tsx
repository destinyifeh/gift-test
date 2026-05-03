'use client';

import {useProfile} from '@/hooks/use-profile';
import {updateProfile} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {z} from 'zod';

const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, hyphens, and underscores');

export function V2CreatorSettingsTab() {
  const queryClient = useQueryClient();
  const {data: profile, isLoading} = useProfile();
  const setUser = useUserStore(state => state.setUser);
  
  const [formData, setFormData] = useState({
    username: '',
  });
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    instagram: '',
    website: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
      });
      setSocialLinks({
        twitter: profile.social_links?.twitter || '',
        instagram: profile.social_links?.instagram || '',
        website: profile.social_links?.website || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    // Validate username
    const validation = usernameSchema.safeParse(formData.username);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({
        ...formData,
        social_links: socialLinks,
      });
      if (result.success) {
        toast.success('Creator profile updated!');
        queryClient.invalidateQueries({queryKey: ['profile']});
        if (profile) {
          setUser({
            ...profile,
            username: formData.username || profile.username || '',
          } as any);
        }
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Creator Profile Section */}
      <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
            Creator Identity
          </h3>
          <p className="text-sm text-[var(--v2-on-surface-variant)]">
            Manage your unique platform URL and username.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">
                  @
                </span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e =>
                    setFormData({...formData, username: e.target.value})
                  }
                  className="w-full h-12 pl-8 pr-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                  placeholder="username"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                Public URL
              </label>
              <input
                type="text"
                value={`gifthance.com/${formData.username || 'username'}`}
                disabled
                className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] border-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Presence */}
      <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
            Social Presence
          </h3>
          <p className="text-sm text-[var(--v2-on-surface-variant)]">
            Connect your digital touchpoints.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
            <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center">
              <span className="v2-icon text-[#1DA1F2]">alternate_email</span>
            </div>
            <input
              type="text"
              value={socialLinks.twitter}
              onChange={e => setSocialLinks({...socialLinks, twitter: e.target.value})}
              placeholder="Twitter/X Profile URL"
              className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
            <div className="w-10 h-10 rounded-full bg-[#E4405F]/10 flex items-center justify-center">
              <span className="v2-icon text-[#E4405F]">photo_camera</span>
            </div>
            <input
              type="text"
              value={socialLinks.instagram}
              onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})}
              placeholder="Instagram Username"
              className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
            <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
              <span className="v2-icon text-[var(--v2-primary)]">language</span>
            </div>
            <input
              type="text"
              value={socialLinks.website}
              onChange={e => setSocialLinks({...socialLinks, website: e.target.value})}
              placeholder="Personal Website"
              className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full md:w-auto md:px-8 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
          {isSaving ? (
            <span className="v2-icon animate-spin">progress_activity</span>
          ) : (
            <>
              Save Creator Settings
              <span className="v2-icon hidden md:inline">check</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
