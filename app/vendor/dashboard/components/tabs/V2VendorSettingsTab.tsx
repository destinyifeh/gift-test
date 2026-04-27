'use client';

import {useCountryConfigs} from '@/hooks/use-country-config';
import {useProfile} from '@/hooks/use-profile';
import {authClient} from '@/lib/auth-client';
import api from '@/lib/api-client';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import {uploadAvatar, deleteUploadedFile} from '@/lib/server/actions/auth';



export function V2VendorSettingsTab() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {data: profile, isLoading} = useProfile();
  const setUser = useUserStore(state => state.setUser);
  const {data: countries, isLoading: isLoadingCountries} = useCountryConfigs();

  const [formData, setFormData] = useState({
    shop_name: '',
    shop_description: '',
    shop_street: '',
    shop_city: '',
    shop_state: '',
    shop_country: 'Nigeria',
    shop_zip: '',
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
        shop_name: profile.shop_name || '',
        shop_description: profile.shop_description || '',
        shop_street: profile.shop_street || '',
        shop_city: profile.shop_city || '',
        shop_state: profile.shop_state || '',
        shop_country: profile.shop_country || 'Nigeria',
        shop_zip: profile.shop_zip || '',
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
      await api.patch('/users', {
        shopName: formData.shop_name,
        shopDescription: formData.shop_description,
        shopStreet: formData.shop_street,
        shopCity: formData.shop_city,
        shopState: formData.shop_state,
        shopCountry: formData.shop_country,
        shopZip: formData.shop_zip,
        socialLinks: socialLinks,
      });
      
      toast.success('Business profile updated!');
      queryClient.invalidateQueries({queryKey: ['profile']});
      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email || '',
          display_name: formData.shop_name || profile.display_name || '',
          username: profile.username || '',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update business profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    const oldUrl = profile?.avatar_url;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      const result = await uploadAvatar(formData);

      if (result.success && result.url) {
        // Actually save it to the profile (this was missing)
        await api.patch('/users', {
          avatarUrl: result.url,
        });

        toast.success('Avatar updated successfully!');
        queryClient.invalidateQueries({queryKey: ['profile']});
        
        // Delete the old one
        if (oldUrl) {
          deleteUploadedFile(oldUrl).catch(err => console.error('Failed to delete old avatar:', err));
        }
      } else {
        toast.error(result.error || 'Failed to upload avatar');
      }
    } catch (error) {
      toast.error('An error occurred during upload');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering file input
    if (!profile?.avatar_url) return;

    const confirmRemove = confirm('Are you sure you want to remove your profile picture?');
    if (!confirmRemove) return;

    setIsUploadingAvatar(true);
    try {
      // 1. Delete from storage if it exists
      if (profile.avatar_url) {
        await deleteUploadedFile(profile.avatar_url);
      }

      // 2. Update profile in database
      await api.patch('/users', {
        avatarUrl: '',
      });

      toast.success('Avatar removed');
      queryClient.invalidateQueries({queryKey: ['profile']});
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      queryClient.clear();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error('Failed to sign out');
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

  const shopName = profile?.shop_name || profile?.display_name || 'Vendor';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)] mb-2">
          Settings
        </h2>
        <p className="text-[var(--v2-on-surface-variant)]">
          Manage your personal info and account preferences.
        </p>
      </div>

      {/* Desktop: Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card - Left column on desktop */}
        <div className="lg:col-span-4 space-y-6">
          {/* Avatar Section */}
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6 text-center">
            <div className="relative inline-block mb-4 group">
              <div
                className="w-28 h-28 rounded-full bg-[var(--v2-surface-container-high)] overflow-hidden mx-auto ring-4 ring-[var(--v2-surface-container-highest)] cursor-pointer relative"
                onClick={handleAvatarClick}>
                {isUploadingAvatar ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-10">
                    <span className="v2-icon text-white animate-spin text-3xl">
                      progress_activity
                    </span>
                  </div>
                ) : null}

                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--v2-primary)]/10">
                    <span className="text-4xl font-bold text-[var(--v2-primary)] capitalize">
                      {formData.shop_name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--v2-primary)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <span className="v2-icon text-sm">edit</span>
              </button>

              {profile?.avatar_url && !isUploadingAvatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[var(--v2-error)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 duration-200"
                  title="Remove avatar">
                  <span className="v2-icon text-sm">delete</span>
                </button>
              )}
            </div>
            <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
              {formData.shop_name || 'Your Business'}
            </h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">
              @{profile?.username || 'username'}
            </p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-[var(--v2-primary-container)] text-[var(--v2-on-primary-container)]">
              Vendor Account
            </span>

            {/* Account Status - Desktop */}
            <div className="hidden lg:block mt-6 pt-6 border-t border-[var(--v2-outline-variant)]/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[var(--v2-on-surface-variant)]">Shop Name</span>
                <span className="text-sm font-bold text-[var(--v2-on-surface)] capitalize">
                  {shopName}
                </span>
              </div>
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

          {/* Logout - Desktop */}
          <div className="hidden lg:block bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6 space-y-3">
            <h4 className="text-sm font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider mb-4">
              Logout
            </h4>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-error)]/5 hover:bg-[var(--v2-error)]/10 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-[var(--v2-error)]/10 flex items-center justify-center">
                <span className="v2-icon text-[var(--v2-error)]">logout</span>
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--v2-error)]">Sign Out</p>
                <p className="text-xs text-[var(--v2-on-surface-variant)]">Log out of your account</p>
              </div>
            </button>
          </div>
        </div>

        {/* Form Section - Right column on desktop */}
        <div className="lg:col-span-8 space-y-6">
          {/* Business Details */}
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
                Business Information
              </h3>
              <p className="text-sm text-[var(--v2-on-surface-variant)] hidden md:block">
                Manage your business identity and store location.
              </p>
            </div>

            <div className="space-y-4">
              {/* Business Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.shop_name}
                  onChange={e => setFormData({...formData, shop_name: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                  placeholder="e.g. Shoprite Ikeja"
                />
              </div>

              {/* Business Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                  Business Description
                </label>
                <textarea
                  value={formData.shop_description}
                  onChange={e => setFormData({...formData, shop_description: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)] resize-none"
                  placeholder="Tell us about your business..."
                />
              </div>

              {/* Street Address */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.shop_street}
                  onChange={e => setFormData({...formData, shop_street: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                  placeholder="123 Business Way"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.shop_city}
                    onChange={e => setFormData({...formData, shop_city: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                    placeholder="Ikeja"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.shop_state}
                    onChange={e => setFormData({...formData, shop_state: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                    placeholder="Lagos"
                  />
                </div>
              </div>

              {/* Country & Zip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      value={formData.shop_country}
                      onChange={e => setFormData({...formData, shop_country: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)] appearance-none">
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Cote d'Ivoire">Cote d'Ivoire</option>
                    </select>
                    <span className="v2-icon absolute right-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                    Zip / Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.shop_zip}
                    onChange={e => setFormData({...formData, shop_zip: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                    placeholder="101233"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Presence - Desktop */}
          <div className="hidden md:block bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
                Social Links
              </h3>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Connect your social profiles.
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
              Social Links
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
                      {socialLinks.twitter ? 'Connected' : 'Not connected'}
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
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      {socialLinks.instagram ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <span className="v2-icon text-[var(--v2-on-surface-variant)]">chevron_right</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-primary)]">language</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--v2-on-surface)]">Website</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">
                      {socialLinks.website ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <span className="v2-icon text-[var(--v2-on-surface-variant)]">chevron_right</span>
              </div>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] font-medium">
              <span className="v2-icon">lock</span>
              Change Password
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--v2-error)]/10 text-[var(--v2-error)] font-bold">
              <span className="v2-icon">logout</span>
              Sign Out
            </button>
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
