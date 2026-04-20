'use client';

import { useProfile } from '@/hooks/use-profile';
import { useAdminSettings, useUpdateAdminSettings, useAdminUpdateProfile, useAdminChangePassword } from '@/hooks/use-admin';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function V2AdminSettingsTab() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: dbSettings, isLoading: settingsLoading } = useAdminSettings();
  
  const updateSettingsMutation = useUpdateAdminSettings();
  const updateProfileMutation = useAdminUpdateProfile();
  const changePasswordMutation = useAdminChangePassword();

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
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Update personal info when profile loads
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        display_name: profile.displayName || '',
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.bio || '',
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

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleSavePersonalInfo = () => {
    updateProfileMutation.mutate({
      display_name: personalInfo.displayName,
      bio: personalInfo.bio,
    });
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields');
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
            <div className="flex items-center gap-4">
              <div className="relative">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover border-4 border-[var(--v2-primary-container)]/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center border-4 border-[var(--v2-primary-container)]/20">
                    <span className="text-3xl font-bold text-[var(--v2-primary)]">
                      {(profile?.displayName || profile?.username || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--v2-primary)] text-white flex items-center justify-center shadow-lg hover:bg-[var(--v2-primary)]/90 transition-colors">
                  <span className="v2-icon text-sm">photo_camera</span>
                </button>
              </div>
              <div>
                <p className="font-bold text-lg text-[var(--v2-on-surface)]">
                  {profile?.displayName || profile?.username || 'Admin'}
                </p>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">@{profile?.username}</p>
                <span className="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]">
                  {formatAdminRole(profile?.adminRole)}
                </span>
              </div>
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
                  value={personalInfo.displayName}
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
              <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">
                Contact support to change your email
              </p>
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
