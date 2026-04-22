'use client';

import {useUpdateCreatorStatus} from '@/hooks/use-auth';
import {useCountryConfigs} from '@/hooks/use-country-config';
import {useProfile} from '@/hooks/use-profile';
import {updateProfile, uploadAvatar, deleteUploadedFile} from '@/lib/server/actions/auth';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';



export function V2SettingsTab() {
  const queryClient = useQueryClient();
  const {data: profile, isLoading} = useProfile();
  const setUser = useUserStore(state => state.setUser);
  const updateCreatorStatus = useUpdateCreatorStatus();
  const {data: countries, isLoading: isLoadingCountries} = useCountryConfigs();

  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    country: '',
    bio: '',
  });
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    instagram: '',
    website: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        country: profile.country || '',
        bio: profile.bio || '',
      });
      setSocialLinks({
        twitter: profile.social_links?.twitter || '',
        instagram: profile.social_links?.instagram || '',
        website: profile.social_links?.website || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({
        ...formData,
        social_links: socialLinks,
      });
      if (result.success) {
        toast.success('Profile updated!');
        queryClient.invalidateQueries({queryKey: ['profile']});
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email || '',
            display_name: formData.display_name || profile.display_name || '',
            username: formData.username || profile.username || '',
          });
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Max size is 5MB' });
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const oldUrl = profile?.avatar_url;
      const uploadRes = await uploadAvatar(formData);
      if (uploadRes.success && uploadRes.url) {
        const updateRes = await updateProfile({ avatar_url: uploadRes.url });
        if (updateRes.success) {
          toast.success('Avatar updated!');
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          
          if (oldUrl) {
            deleteUploadedFile(oldUrl).catch(err => console.error('Failed to delete old avatar:', err));
          }

          if (profile) {
            setUser({
              ...profile,
              avatar_url: uploadRes.url,
            } as any);
          }
        } else {
          toast.error('Failed to update profile with new avatar');
        }
      } else {
        toast.error(uploadRes.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('An error occurred during upload');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url) return;
    
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    const oldUrl = profile.avatar_url;
    setIsUploadingAvatar(true);

    try {
      // 1. Update profile to clear the URL first (so UI updates fast)
      const updateRes = await updateProfile({ avatar_url: '' });
      if (updateRes.success) {
        toast.success('Avatar removed');
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        
        // 2. Clear store
        if (profile) {
          setUser({
            ...profile,
            avatar_url: '',
          } as any);
        }

        // 3. Delete from storage (async, don't block success)
        deleteUploadedFile(oldUrl).catch(err => console.error('Failed to delete file from storage:', err));
        
      } else {
        toast.error('Failed to clear avatar from profile');
      }
    } catch (err) {
      toast.error('An error occurred while removing avatar');
    } finally {
      setIsUploadingAvatar(false);
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
    <div className="max-w-4xl mx-auto">
      {/* Desktop: Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card - Left column on desktop */}
        <div className="lg:col-span-4 space-y-6">
          {/* Avatar Section */}
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6 text-center">
            <div className="relative inline-block mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <div className="w-28 h-28 rounded-full bg-[var(--v2-surface-container-high)] overflow-hidden mx-auto ring-4 ring-[var(--v2-surface-container-highest)] relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--v2-primary)]/10">
                    <span className="text-4xl font-bold text-[var(--v2-primary)] capitalize">
                      {formData.display_name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="v2-icon text-white animate-spin">progress_activity</span>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 right-0 flex flex-col gap-1 translate-x-2">
                {profile?.avatar_url && !isUploadingAvatar && (
                  <button 
                    onClick={handleRemoveAvatar}
                    className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95">
                    <span className="v2-icon text-sm">delete</span>
                  </button>
                )}
                <button 
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="w-8 h-8 rounded-full bg-[var(--v2-primary)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 disabled:opacity-50">
                  <span className="v2-icon text-sm">edit</span>
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              {formData.display_name || 'Your Name'}
            </h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">
              @{formData.username || 'username'}
            </p>

            {/* Account Status - Desktop */}
            <div className="hidden lg:block mt-6 pt-6 border-t border-[var(--v2-outline-variant)]/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[var(--v2-on-surface-variant)]">Account Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]">
                  Verified
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--v2-on-surface-variant)]">Member Since</span>
                <span className="text-sm font-bold text-[var(--v2-on-surface)]">
                  {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Form Section - Right column on desktop */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal Details */}
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
                Personal Profile
              </h3>
              <p className="text-sm text-[var(--v2-on-surface-variant)] hidden md:block">
                Manage how your identity appears across the platform.
              </p>
            </div>

            <div className="space-y-4">
              {/* Display Name & Username - side by side on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={e => setFormData({...formData, display_name: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                    placeholder="Your display name"
                  />
                </div>
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
                        setFormData({...formData, username: e.target.value.toLowerCase()})
                      }
                      className="w-full h-12 pl-8 pr-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Country - side by side on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] border-none cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      value={formData.country}
                      disabled
                      onChange={e => setFormData({...formData, country: e.target.value})}
                      className="w-full h-12 px-4 pl-4 rounded-xl bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] border-none cursor-not-allowed appearance-none">
                      <option value="">Select country</option>
                      {isLoadingCountries ? (
                         <option disabled>Loading countries...</option>
                      ) : (
                        (countries || []).map(c => (
                          <option key={c.countryCode} value={c.countryName}>
                            {c.flag} {c.countryName}
                          </option>
                        ))
                      )}
                    </select>
                    <span className="v2-icon absolute right-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]/40 pointer-events-none text-base">
                      lock
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--v2-on-surface-variant)] leading-tight mt-1 opacity-70">
                    This determines your currency and available gifting features.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Presence - Desktop */}
          <div className="hidden md:block bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6">
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

          {/* Linked Accounts - Mobile only */}
          <div className="md:hidden bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5">
            <h3 className="text-base font-bold v2-headline text-[var(--v2-on-surface)] mb-4">
              Linked Accounts
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center">
                    <span className="v2-icon text-[#1DA1F2]">alternate_email</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--v2-on-surface)]">Twitter / X</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      {socialLinks.twitter ? `Connected as ${socialLinks.twitter}` : 'Not connected'}
                    </p>
                  </div>
                </div>
                <span className="v2-icon text-[var(--v2-on-surface-variant)]">chevron_right</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E4405F]/10 flex items-center justify-center">
                    <span className="v2-icon text-[#E4405F]">photo_camera</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--v2-on-surface)]">Instagram</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">Not connected</p>
                  </div>
                </div>
                <button className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]">
                  Link
                </button>
              </div>
            </div>
          </div>

          {/* Change Password - Mobile */}
          <div className="md:hidden">
            <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-medium">
              <span className="v2-icon">lock</span>
              Change Account Password
            </button>
          </div>

          {/* Gift Page Status - New Section */}
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6 border-2 border-[var(--v2-primary)]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profile?.is_creator ? 'bg-[var(--v2-primary)]/20' : 'bg-[var(--v2-surface-container-high)]'}`}>
                  <span className={`v2-icon text-2xl ${profile?.is_creator ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface-variant)]'}`} style={{fontVariationSettings: "'FILL' 1"}}>
                    auto_awesome
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--v2-on-surface)] v2-headline">
                    Public Gift Page
                  </h3>
                  <p className="text-xs text-[var(--v2-on-surface-variant)]">
                    {profile?.is_creator 
                      ? `Active at gifthance.com/${profile?.username}`
                      : 'Disabled (People cannot send you gifts)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const newStatus = !profile?.is_creator;
                  updateCreatorStatus.mutate(newStatus, {
                    onSuccess: () => {
                      toast.success(newStatus ? 'Gift page enabled!' : 'Gift page disabled');
                    }
                  });
                }}
                disabled={updateCreatorStatus.isPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)] focus:ring-offset-2 ${
                  profile?.is_creator ? 'bg-[var(--v2-primary)]' : 'bg-[var(--v2-surface-container-high)]'
                }`}
              >
                <span
                  className={`${
                    profile?.is_creator ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="hidden md:block flex-1 h-12 bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors">
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 md:flex-none md:px-8 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? (
                <span className="v2-icon animate-spin">progress_activity</span>
              ) : (
                <>
                  Save Changes
                  <span className="v2-icon hidden md:inline">check</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
