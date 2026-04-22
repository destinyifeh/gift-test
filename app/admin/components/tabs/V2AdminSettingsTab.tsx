'use client';

import { useAllCountryConfigs, CountryConfig, useCountryConfigs } from '@/hooks/use-country-config';
import { useProfile } from '@/hooks/use-profile';
import { useAdminSettings, useUpdateAdminSettings, useAdminUpdateProfile, useAdminChangePassword, useAdminUpdateCountryConfig } from '@/hooks/use-admin';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { uploadAvatar, updateProfile, deleteUploadedFile } from '@/lib/server/actions/auth';
import { useQueryClient } from '@tanstack/react-query';

export function V2AdminSettingsTab() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: dbSettings, isLoading: settingsLoading } = useAdminSettings();
  
  const updateSettingsMutation = useUpdateAdminSettings();
  const updateProfileMutation = useAdminUpdateProfile();
  const changePasswordMutation = useAdminChangePassword();
  
  const { data: countryConfigsData, isLoading: countriesLoading } = useAllCountryConfigs();
  const { data: countries, isLoading: isLoadingCountries } = useCountryConfigs();
  const updateCountryMutation = useAdminUpdateCountryConfig();
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  // Platform settings
  const [settings, setSettings] = useState({
    platformFee: 5,
    minWithdrawal: 1000,
    maxWithdrawal: 500000,
    maintenanceMode: false,
    newRegistrations: true,
    vendorApplications: true,
    emailNotifications: true,
  });

  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    display_name: '',
    username: '',
    email: '',
    bio: '',
    country: '',
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Password strength indicators
  const hasMinLength = passwordForm.newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordForm.newPassword);
  const hasNumber = /[0-9]/.test(passwordForm.newPassword);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update personal info when profile loads
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        display_name: profile.display_name || '',
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.bio || '',
        country: profile.country || '',
      });
    }
  }, [profile]);

  // Sync settings with DB
  useEffect(() => {
    if (dbSettings) {
      setSettings(prev => ({
        ...prev,
        ...dbSettings
      }));
    }
  }, [dbSettings]);

  const handleUpdateCountryToggle = (code: string, field: string, value: any, isFeature: boolean = false) => {
    const country = countryConfigsData?.find(c => c.countryCode === code);
    if (!country) return;
    
    const updates = isFeature 
      ? { ...country, features: { ...country.features, [field]: value } }
      : { ...country, [field]: value };
    
    updateCountryMutation.mutate(updates);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleSavePersonalInfo = () => {
    updateProfileMutation.mutate({
      display_name: personalInfo.display_name,
      bio: personalInfo.bio,
    });
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    }, {
      onSuccess: () => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      }
    });
  };

  const onAvatarUpload = async (file: File) => {
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Max size is 5MB' });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const oldUrl = profile?.avatar_url;
      const uploadRes = await uploadAvatar(formData);

      if (uploadRes.success && uploadRes.url) {
        const updateRes = await updateProfile({ avatar_url: uploadRes.url });
        if (updateRes.success) {
          toast.success('Profile photo updated');
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          
          if (oldUrl) {
             deleteUploadedFile(oldUrl).catch(err => console.error('Failed to delete old avatar:', err));
          }
        } else {
          toast.error('Failed to update profile with new photo');
        }
      } else {
        toast.error(uploadRes.error || 'Failed to upload photo');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url) return;
    
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    const oldUrl = profile.avatar_url;
    setIsUploading(true);

    try {
      const updateRes = await updateProfile({ avatar_url: '' });
      if (updateRes.success) {
        toast.success('Avatar removed');
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        
        deleteUploadedFile(oldUrl).catch(err => console.error('Failed to delete file from storage:', err));
        
      } else {
        toast.error('Failed to clear avatar from profile');
      }
    } catch (err) {
      toast.error('An error occurred while removing avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const formatAdminRole = (role: string | null) => {
    if (!role) return 'Admin';
    const formatted = role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return formatted.toLowerCase().includes('admin') ? formatted : `${formatted} Admin`;
  };

  if (profileLoading || settingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mt-3">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl md:text-4xl font-black v2-headline text-[var(--v2-on-surface)] tracking-tight">
          Settings
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] mt-2 font-medium">
          Manage your profile and platform settings.
        </p>
      </div>

      {/* Admin Personal Info */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--v2-surface-container)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
            <span className="v2-icon text-2xl text-[var(--v2-primary)]">person</span>
          </div>
          <div>
            <h4 className="v2-headline font-bold text-lg">Personal Information</h4>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">
              Update your admin profile details
            </p>
          </div>
        </div>
        <div className="p-8">
          {/* Avatar & Role Display */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-[var(--v2-surface-container)]">
              <div className="relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onAvatarUpload(file);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover border-4 border-[var(--v2-primary-container)]/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center border-4 border-[var(--v2-primary-container)]/20">
                    <span className="text-3xl font-bold text-[var(--v2-primary)]">
                      {(profile?.display_name || profile?.username || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="absolute -bottom-1 -right-1 flex flex-col gap-1 translate-x-2">
                  {profile?.avatar_url && !isUploading && (
                    <button 
                      onClick={handleRemoveAvatar}
                      className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95">
                      <span className="v2-icon text-sm">delete</span>
                    </button>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-8 h-8 rounded-full bg-[var(--v2-primary)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 disabled:opacity-50">
                    {isUploading ? (
                      <span className="v2-icon text-sm animate-spin">progress_activity</span>
                    ) : (
                      <span className="v2-icon text-sm">edit</span>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <p className="font-bold text-lg text-[var(--v2-on-surface)]">
                  {profile?.display_name || profile?.username || 'Admin'}
                </p>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">@{profile?.username}</p>
                <span className="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]">
                  {formatAdminRole(profile?.admin_role)}
                </span>
              </div>
            </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={personalInfo.display_name}
                  onChange={e => setPersonalInfo({ ...personalInfo, display_name: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                  placeholder="Your display name"
                />
              </div>

              {/* Username (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={personalInfo.username}
                  disabled
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)]/50 rounded-xl border-none text-[var(--v2-on-surface-variant)] cursor-not-allowed"
                />
                <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">
                  Username cannot be changed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={personalInfo.email}
                  disabled
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)]/50 rounded-xl border-none text-[var(--v2-on-surface-variant)] cursor-not-allowed"
                />
              </div>

              {/* Country (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                  Country
                </label>
                <div className="relative">
                  <select
                    value={personalInfo.country}
                    disabled
                    className="w-full px-4 py-3 bg-[var(--v2-surface-container)]/50 rounded-xl border-none text-[var(--v2-on-surface-variant)] cursor-not-allowed appearance-none"
                  >
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
                  <span className="v2-icon absolute right-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]/40 text-base">
                    lock
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Member Since (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                  Member Since
                </label>
                <div className="px-4 py-3 bg-[var(--v2-surface-container)]/50 rounded-xl text-[var(--v2-on-surface-variant)] flex items-center justify-between">
                  <span>Registration Year</span>
                  <span className="font-bold">
                    {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                Bio
              </label>
              <textarea
                value={personalInfo.bio}
                onChange={e => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSavePersonalInfo}
                disabled={updateProfileMutation.isPending}
                className="px-8 py-3 v2-hero-gradient text-white rounded-full font-bold shadow-lg shadow-[var(--v2-primary)]/20 hover:opacity-90 transition-opacity disabled:opacity-50">
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security / Password */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--v2-surface-container)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="v2-icon text-2xl text-amber-600">lock</span>
          </div>
          <div>
            <h4 className="v2-headline font-bold text-lg">Security</h4>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">
              Manage your password and security settings
            </p>
          </div>
        </div>
        <div className="p-8">
          {!showPasswordForm ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-bold">Password</p>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">
                  Last changed: Never
                </p>
              </div>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-6 py-3 border border-[var(--v2-outline-variant)]/20 rounded-full font-bold hover:bg-[var(--v2-surface-container)] transition-colors">
                Change Password
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                />
              </div>

              {/* Password Requirements */}
              {passwordForm.newPassword && (
                <div className="space-y-2 pt-1 pb-2">
                  <PasswordRequirement met={hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={hasUppercase} text="One uppercase letter" />
                  <PasswordRequirement met={hasNumber} text="One number" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--v2-on-surface)] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-6 py-3 border border-[var(--v2-outline-variant)]/20 rounded-full font-bold hover:bg-[var(--v2-surface-container)] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="px-6 py-3 bg-[var(--v2-primary)] text-white rounded-full font-bold hover:opacity-90 transition-opacity">
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--v2-surface-container)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="v2-icon text-2xl text-blue-600">tune</span>
          </div>
          <div>
            <h4 className="v2-headline font-bold text-lg">Platform Settings</h4>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">
              Configure platform-wide settings and policies
            </p>
          </div>
        </div>
        <div className="p-8 space-y-6">
          {/* Platform Fee */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-bold">Platform Fee</p>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Percentage charged on each transaction
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.platformFee}
                onChange={e => setSettings({ ...settings, platformFee: parseFloat(e.target.value) })}
                className="w-24 px-4 py-2 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
              />
              <span className="text-[var(--v2-on-surface-variant)]">%</span>
            </div>
          </div>

          {/* Min Withdrawal */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-bold">Minimum Withdrawal</p>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Minimum amount users can withdraw
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--v2-on-surface-variant)]">₦</span>
              <input
                type="number"
                value={settings.minWithdrawal}
                onChange={e => setSettings({ ...settings, minWithdrawal: parseInt(e.target.value) })}
                className="w-32 px-4 py-2 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
              />
            </div>
          </div>

          {/* Max Withdrawal */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-bold">Maximum Withdrawal</p>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Maximum amount per withdrawal request
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--v2-on-surface-variant)]">₦</span>
              <input
                type="number"
                value={settings.maxWithdrawal}
                onChange={e => setSettings({ ...settings, maxWithdrawal: parseInt(e.target.value) })}
                className="w-32 px-4 py-2 bg-[var(--v2-surface-container)] rounded-xl border-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--v2-surface-container)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="v2-icon text-2xl text-emerald-600">toggle_on</span>
          </div>
          <div>
            <h4 className="v2-headline font-bold text-lg">Feature Toggles</h4>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">
              Enable or disable platform features
            </p>
          </div>
        </div>
        <div className="divide-y divide-[var(--v2-surface-container)]">
          {/* Maintenance Mode */}
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <p className="font-bold">Maintenance Mode</p>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Temporarily disable the platform for maintenance
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-[var(--v2-error)]' : 'bg-[var(--v2-surface-container)]'
                }`}>
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'
                  }`}
              />
            </button>
          </div>

          {/* New Registrations */}
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <p className="font-bold">New Registrations</p>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">Allow new user sign ups</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, newRegistrations: !settings.newRegistrations })}
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.newRegistrations ? 'bg-emerald-500' : 'bg-[var(--v2-surface-container)]'
                }`}>
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.newRegistrations ? 'right-1' : 'left-1'
                  }`}
              />
            </button>
          </div>

          {/* Vendor Applications */}
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <p className="font-bold">Vendor Applications</p>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Accept new vendor applications
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, vendorApplications: !settings.vendorApplications })
              }
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.vendorApplications ? 'bg-emerald-500' : 'bg-[var(--v2-surface-container)]'
                }`}>
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.vendorApplications ? 'right-1' : 'left-1'
                  }`}
              />
            </button>
          </div>

          {/* Email Notifications */}
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <p className="font-bold">Email Notifications</p>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Send email notifications to users
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, emailNotifications: !settings.emailNotifications })
              }
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.emailNotifications ? 'bg-emerald-500' : 'bg-[var(--v2-surface-container)]'
                }`}>
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.emailNotifications ? 'right-1' : 'left-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Country Configurations */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-[var(--v2-surface-container)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="v2-icon text-2xl text-purple-600">public</span>
            </div>
            <div>
              <h4 className="v2-headline font-bold text-lg">Country Configurations</h4>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                Manage supported countries, active features, and withdrawal rules
              </p>
            </div>
          </div>
        </div>
        
        {countriesLoading ? (
          <div className="p-8 text-center text-[var(--v2-on-surface-variant)]">Loading countries...</div>
        ) : (
          <div className="divide-y divide-[var(--v2-surface-container)]">
            {(countryConfigsData || []).map((country: CountryConfig) => (
              <div key={country.countryCode} className="border-b border-[var(--v2-surface-container)] last:border-b-0">
                <div 
                  onClick={() => setExpandedCountry(expandedCountry === country.countryCode ? null : country.countryCode)}
                  className="px-8 py-5 flex items-center justify-between cursor-pointer hover:bg-[var(--v2-surface-container)]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <p className="font-bold">{country.countryName} <span className="text-xs ml-2 text-[var(--v2-on-surface-variant)] font-normal">{country.currency}</span></p>
                      <p className="text-sm text-[var(--v2-on-surface-variant)]">
                        Status: <span className={country.isEnabled ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-semibold'}>{country.isEnabled ? 'Active' : 'Disabled'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateCountryToggle(country.countryCode, 'isEnabled', !country.isEnabled);
                      }}
                      className={`w-14 h-8 rounded-full transition-colors relative ${country.isEnabled ? 'bg-emerald-500' : 'bg-[var(--v2-surface-container)]'}`}
                    >
                      <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${country.isEnabled ? 'right-1' : 'left-1'}`} />
                    </button>
                    <span className={`v2-icon transition-transform ${expandedCountry === country.countryCode ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                </div>

                {expandedCountry === country.countryCode && (
                  <div className="px-8 py-6 bg-[var(--v2-surface-container)]/10 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      
                      {/* Financial Rules */}
                      <div className="space-y-4">
                        <h5 className="font-bold text-[var(--v2-on-surface)] flex items-center gap-2">
                          <span className="v2-icon text-[var(--v2-primary)] text-lg">payments</span> Financial Rules
                        </h5>
                        
                        <div className="flex items-center justify-between col-span-1">
                          <p className="text-sm font-medium">Transaction Fee (%)</p>
                          <input 
                            type="number" 
                            defaultValue={country.transactionFeePercent} 
                            onBlur={(e) => handleUpdateCountryToggle(country.countryCode, 'transactionFeePercent', parseFloat(e.target.value))}
                            className="w-20 px-3 py-1 bg-[var(--v2-surface-container)] rounded-lg text-right outline-none focus:ring-1 focus:ring-[var(--v2-primary)]"
                          />
                        </div>
                        <div className="flex items-center justify-between col-span-1">
                          <p className="text-sm font-medium">Withdrawal Fee Flat</p>
                          <input 
                            type="number" 
                            defaultValue={country.withdrawalFeeFlat} 
                            onBlur={(e) => handleUpdateCountryToggle(country.countryCode, 'withdrawalFeeFlat', parseFloat(e.target.value))}
                            className="w-24 px-3 py-1 bg-[var(--v2-surface-container)] rounded-lg text-right outline-none focus:ring-1 focus:ring-[var(--v2-primary)]"
                          />
                        </div>
                        <div className="flex items-center justify-between col-span-1">
                          <p className="text-sm font-medium">Min Withdrawal</p>
                          <input 
                            type="number" 
                            defaultValue={country.minWithdrawal} 
                            onBlur={(e) => handleUpdateCountryToggle(country.countryCode, 'minWithdrawal', parseInt(e.target.value))}
                            className="w-28 px-3 py-1 bg-[var(--v2-surface-container)] rounded-lg text-right outline-none focus:ring-1 focus:ring-[var(--v2-primary)]"
                          />
                        </div>
                        <div className="flex items-center justify-between col-span-1">
                          <p className="text-sm font-medium">Max Withdrawal</p>
                          <input 
                            type="number" 
                            defaultValue={country.maxWithdrawal} 
                            onBlur={(e) => handleUpdateCountryToggle(country.countryCode, 'maxWithdrawal', parseInt(e.target.value))}
                            className="w-28 px-3 py-1 bg-[var(--v2-surface-container)] rounded-lg text-right outline-none focus:ring-1 focus:ring-[var(--v2-primary)]"
                          />
                        </div>
                      </div>

                      {/* Feature Access */}
                      <div className="space-y-4">
                        <h5 className="font-bold text-[var(--v2-on-surface)] flex items-center gap-2">
                          <span className="v2-icon text-[var(--v2-primary)] text-lg">extension</span> Feature Toggles
                        </h5>
                        
                        {[
                          { key: 'creatorSupport', label: 'Creator Support' },
                          { key: 'vendorShop', label: 'Vendor Shop' },
                          { key: 'campaigns', label: 'Campaigns' },
                          { key: 'flexCard', label: 'Flex Card' },
                          { key: 'directGift', label: 'Direct Gift' },
                          { key: 'withdrawals', label: 'Withdrawals' }
                        ].map((feature) => (
                          <div key={feature.key} className="flex items-center justify-between">
                            <p className="text-sm font-medium">{feature.label}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateCountryToggle(country.countryCode, feature.key, !country.features[feature.key as keyof typeof country.features], true);
                              }}
                              className={`w-10 h-6 rounded-full transition-colors relative ${(country.features as any)?.[feature.key] ? 'bg-emerald-500' : 'bg-[var(--v2-outline-variant)]'}`}
                            >
                              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${(country.features as any)?.[feature.key] ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="px-8 py-3 v2-hero-gradient text-white rounded-full font-bold shadow-lg shadow-[var(--v2-primary)]/20 hover:opacity-90 transition-opacity disabled:opacity-50">
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save Platform Settings'}
        </button>
      </div>
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
          met ? 'bg-[var(--v2-secondary)]' : 'bg-[var(--v2-surface-container-high)]'
        }`}>
        {met && (
          <span className="v2-icon text-xs text-[var(--v2-on-secondary)]">
            check
          </span>
        )}
      </div>
      <span
        className={`text-xs transition-colors ${
          met ? 'text-[var(--v2-secondary)]' : 'text-[var(--v2-on-surface-variant)]'
        }`}>
        {text}
      </span>
    </div>
  );
}
