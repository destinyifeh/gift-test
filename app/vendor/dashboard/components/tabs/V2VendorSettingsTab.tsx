'use client';

import {useCountryConfigs} from '@/hooks/use-country-config';
import {useProfile} from '@/hooks/use-profile';
import {useGiftCards} from '@/hooks/use-gift-cards';
import {authClient} from '@/lib/auth-client';
import api from '@/lib/api-client';
import {useUserStore} from '@/lib/store/useUserStore';
import {useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import {uploadAvatar, uploadShopLogo, deleteUploadedFile, updateProfile} from '@/lib/server/actions/auth';
import {V2LogoutModal} from '@/components/V2LogoutModal';



export function V2VendorSettingsTab() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {data: profile, isLoading} = useProfile();
  const setUser = useUserStore(state => state.setUser);
  const {data: countries, isLoading: isLoadingCountries} = useCountryConfigs();

  // Gift cards
  const {data: giftCardsData} = useGiftCards();
  const allGiftCards = Array.isArray(giftCardsData) ? giftCardsData : (giftCardsData?.data || []);
  const flexCardId = allGiftCards.find((c: any) => c.name === 'Flex Card')?.id;

  const [formData, setFormData] = useState({
    shop_name: '',
    shop_description: '',
    shop_slug: '',
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
  const [acceptedGiftCards, setAcceptedGiftCards] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'business' | 'cards' | 'social'>('profile');


  useEffect(() => {
    if (profile) {
      setFormData({
        shop_name: (profile.shop_name && profile.shop_name !== 'free' ? profile.shop_name : ''),
        shop_description: profile.shop_description || '',
        shop_slug: profile.shop_slug || profile.username || '',
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
      setAcceptedGiftCards(profile.vendor_accepted_gift_cards || []);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch('/users', {
        shopName: formData.shop_name,
        shopDescription: formData.shop_description,
        shopSlug: formData.shop_slug,
        shopStreet: formData.shop_street,
        shopCity: formData.shop_city,
        shopState: formData.shop_state,
        shopCountry: formData.shop_country,
        shopZip: formData.shop_zip,
        socialLinks: socialLinks,
        acceptedGiftCards: acceptedGiftCards.filter((id) => id !== flexCardId),
      });
      
      toast.success('Business settings saved!');
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
      const serverMessage = error.response?.data?.message;
      const displayError = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage;
      toast.error(displayError || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar upload handlers
  const handleAvatarClick = () => avatarInputRef.current?.click();
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }

    setIsUploadingAvatar(true);
    const oldUrl = profile?.avatar_url;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');
      const result = await uploadAvatar(formData);
      if (result.success && result.url) {
        await api.patch('/users', { avatarUrl: result.url });
        toast.success('Profile picture updated!');
        queryClient.invalidateQueries({queryKey: ['profile']});
        if (oldUrl) deleteUploadedFile(oldUrl).catch(() => {});
      } else {
        toast.error(result.error || 'Failed to upload');
      }
    } catch { toast.error('Upload failed'); }
    finally { setIsUploadingAvatar(false); }
  };

  const handleRemoveAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile?.avatar_url) return;
    if (!confirm('Remove your profile picture?')) return;
    setIsUploadingAvatar(true);
    try {
      await deleteUploadedFile(profile.avatar_url);
      await api.patch('/users', { avatarUrl: '' });
      toast.success('Avatar removed');
      queryClient.invalidateQueries({queryKey: ['profile']});
    } catch { toast.error('Failed to remove avatar'); }
    finally { setIsUploadingAvatar(false); }
  };

  // Logo upload handlers
  const handleLogoClick = () => logoInputRef.current?.click();
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be less than 2MB'); return; }

    setIsUploadingLogo(true);
    try {
      if (profile?.shop_logo_url) {
        await deleteUploadedFile(profile.shop_logo_url).catch(() => {});
      }
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadShopLogo(formData);
      if (result.success && result.url) {
        await updateProfile({ shop_logo_url: result.url });
        toast.success('Business logo updated!');
        queryClient.invalidateQueries({queryKey: ['profile']});
      } else {
        toast.error(result.error || 'Failed to upload logo');
      }
    } catch { toast.error('Upload failed'); }
    finally { setIsUploadingLogo(false); }
  };

  const handleRemoveLogo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile?.shop_logo_url) return;
    if (!confirm('Remove your business logo?')) return;
    setIsUploadingLogo(true);
    try {
      await deleteUploadedFile(profile.shop_logo_url);
      await updateProfile({ shop_logo_url: '' });
      toast.success('Logo removed');
      queryClient.invalidateQueries({queryKey: ['profile']});
    } catch { toast.error('Failed to remove logo'); }
    finally { setIsUploadingLogo(false); }
  };

  const handleSignOut = async () => {
    setIsSaving(true); // Using isSaving for logout loading too
    try {
      await authClient.signOut();
      queryClient.clear();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch { 
      toast.error('Failed to sign out'); 
    } finally {
      setIsSaving(false);
      setIsLogoutModalOpen(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">progress_activity</span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading settings...</p>
      </div>
    );
  }

  const businessName = (profile?.shop_name && profile.shop_name !== 'free' ? profile.shop_name : '') || profile?.display_name || 'Business';

  // Section config for internal navigation
  const sections = [
    { id: 'profile' as const, label: 'Profile', icon: 'person' },
    { id: 'business' as const, label: 'Business', icon: 'store' },
    { id: 'cards' as const, label: 'Gift Cards', icon: 'payments' },
    { id: 'social' as const, label: 'Social', icon: 'share' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)] mb-2">
            Settings
          </h2>
          <p className="text-[var(--v2-on-surface-variant)]">
            Manage your business profile, branding, and gift card acceptance.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 v2-hero-gradient text-[var(--v2-on-primary)] rounded-xl font-bold shadow-lg shadow-[var(--v2-primary)]/20 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
          {isSaving ? (
            <span className="v2-icon animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="v2-icon">check</span>
              Save All Changes
            </>
          )}
        </button>
      </div>

      {/* Section Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 v2-no-scrollbar">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
              activeSection === s.id
                ? 'bg-[var(--v2-primary)] text-white border-[var(--v2-primary)] shadow-lg shadow-[var(--v2-primary)]/20'
                : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] border-[var(--v2-outline-variant)]/15 hover:bg-[var(--v2-surface-container-high)]'
            }`}
          >
            <span className="v2-icon text-base" style={activeSection === s.id ? { fontVariationSettings: "'FILL' 1" } : undefined}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* PROFILE SECTION */}
      {/* ═══════════════════════════════════════════ */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          {/* Business Identity Form */}
          <div className="space-y-6">
            <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">Business Identity</h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">Your public name and description.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Business Name</label>
                  <input
                    type="text"
                    value={formData.shop_name}
                    onChange={e => {
                      const value = e.target.value;
                      setFormData({...formData, shop_name: value, shop_slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')});
                    }}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]"
                    placeholder="e.g. Shoprite Ikeja"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Business URL</label>
                  <div className="flex items-center bg-[var(--v2-surface-container-low)] rounded-xl px-4 h-12 focus-within:ring-2 ring-[var(--v2-primary)] transition-all">
                    <span className="text-[var(--v2-on-surface-variant)]/60 text-sm">gifthance.com/vendor/</span>
                    <input
                      type="text"
                      value={formData.shop_slug}
                      onChange={e => setFormData({...formData, shop_slug: e.target.value})}
                      className="bg-transparent border-none p-0 ml-1 text-[var(--v2-on-surface)] w-full focus:ring-0"
                      placeholder="your-business"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Business Description</label>
                  <textarea
                    value={formData.shop_description}
                    onChange={e => setFormData({...formData, shop_description: e.target.value})}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)] resize-none"
                    placeholder="Tell customers about your business..."
                  />
                  <p className="text-right text-[10px] font-bold text-[var(--v2-on-surface-variant)]/40 uppercase">{formData.shop_description.length}/500</p>
                </div>
              </div>
            </div>

            {/* Sign Out — Mobile */}
            <div className="md:hidden space-y-3">
              <button onClick={() => setIsLogoutModalOpen(true)} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--v2-error)]/10 text-[var(--v2-error)] font-bold">
                <span className="v2-icon">logout</span> Sign Out
              </button>
            </div>


            {/* Logout — Desktop */}
            <div className="hidden md:block bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6">
              <button onClick={() => setIsLogoutModalOpen(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-error)]/5 hover:bg-[var(--v2-error)]/10 transition-colors text-left">
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
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* BUSINESS DETAILS SECTION */}
      {/* ═══════════════════════════════════════════ */}
      {activeSection === 'business' && (
        <div className="space-y-6">
          {/* Business Logo */}
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6 md:p-8">
            <h3 className="text-lg font-bold v2-headline mb-6">Business Logo</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
              <div onClick={handleLogoClick} className="relative group cursor-pointer">
                <div className={`w-32 h-32 rounded-2xl overflow-hidden bg-[var(--v2-surface-container-low)] flex items-center justify-center border-2 border-dashed transition-all ${
                  isUploadingLogo ? 'border-[var(--v2-primary)] opacity-50' : 'border-[var(--v2-outline-variant)]/30 group-hover:border-[var(--v2-primary)]/50'
                }`}>
                  {profile?.shop_logo_url ? (
                    <img src={profile.shop_logo_url} alt="Logo" className="w-full h-full object-cover opacity-90 group-hover:opacity-40 transition-opacity" />
                  ) : (
                    <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30">store</span>
                  )}
                  {isUploadingLogo ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="v2-icon text-[var(--v2-primary)] text-3xl animate-spin">progress_activity</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="v2-icon text-[var(--v2-primary)] text-3xl">cloud_upload</span>
                    </div>
                  )}
                </div>
                {profile?.shop_logo_url && !isUploadingLogo && (
                  <button onClick={handleRemoveLogo} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--v2-error)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-10">
                    <span className="v2-icon text-sm">delete</span>
                  </button>
                )}
              </div>
              <div className="text-center md:text-left">
                <p className="font-bold text-[var(--v2-on-surface)] mb-1">Upload your business logo</p>
                <p className="text-xs text-[var(--v2-on-surface-variant)]">Recommended 512×512px. PNG, JPG, or WEBP. Max 2MB.</p>
                <button onClick={handleLogoClick} className="mt-3 text-sm font-bold text-[var(--v2-primary)] flex items-center gap-1 hover:underline mx-auto md:mx-0">
                  <span className="v2-icon text-sm">{profile?.shop_logo_url ? 'edit' : 'add_photo_alternate'}</span>
                  {profile?.shop_logo_url ? 'Change Logo' : 'Add Logo'}
                </button>
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-5 md:p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold v2-headline">Business Address</h3>
                <p className="text-sm text-[var(--v2-on-surface-variant)]">Your physical location for customer discovery.</p>
              </div>
              <div className="flex items-center gap-2 text-[var(--v2-primary)] bg-[var(--v2-primary)]/5 px-3 py-1.5 rounded-full">
                <span className="v2-icon text-sm">verified</span>
                <span className="text-xs font-bold">Verified</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Street Address</label>
                <input type="text" value={formData.shop_street} onChange={e => setFormData({...formData, shop_street: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]" placeholder="123 Business Way" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">City</label>
                  <input type="text" value={formData.shop_city} onChange={e => setFormData({...formData, shop_city: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]" placeholder="Ikeja" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">State</label>
                  <input type="text" value={formData.shop_state} onChange={e => setFormData({...formData, shop_state: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]" placeholder="Lagos" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Country</label>
                  <div className="relative">
                    <select value={formData.shop_country} onChange={e => setFormData({...formData, shop_country: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)] appearance-none">
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Cote d'Ivoire">Cote d'Ivoire</option>
                    </select>
                    <span className="v2-icon absolute right-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">Zip / Postal Code</label>
                  <input type="text" value={formData.shop_zip} onChange={e => setFormData({...formData, shop_zip: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface)] border-none focus:ring-2 focus:ring-[var(--v2-primary)]" placeholder="101233" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* GIFT CARD ACCEPTANCE */}
      {/* ═══════════════════════════════════════════ */}
      {activeSection === 'cards' && (
        <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold v2-headline flex items-center gap-2">
                <span className="v2-icon text-[var(--v2-primary)]">payments</span>
                Accepted Gift Cards
              </h3>
              <p className="text-sm text-[var(--v2-on-surface-variant)] mt-1">
                Select which gift cards can be redeemed at your business.
              </p>
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${acceptedGiftCards.filter((id) => id !== flexCardId).length >= 5 ? 'bg-red-100 text-red-600' : 'bg-[var(--v2-primary-container)]/20 text-[var(--v2-primary)]'}`}>
              {acceptedGiftCards.filter((id) => id !== flexCardId).length}/5 Cards Selected
            </span>
          </div>

          <p className="text-[12px] text-[var(--v2-on-surface-variant)] leading-relaxed italic mb-6">
            You can accept up to 5 specific gift cards. The <strong>Flex Card</strong> is automatically accepted by all verified businesses and does not count towards this limit.
          </p>

          <div className="space-y-6">
            {/* Fixed Flex Card */}
            <div className="space-y-2">
              <h5 className="text-sm font-black text-[var(--v2-on-surface)]">💳 Flex Card Rule</h5>
              <label className="flex items-center gap-3 py-1 cursor-not-allowed opacity-80">
                <input type="checkbox" className="w-4 h-4 rounded text-[var(--v2-primary)] border-gray-300 focus:ring-[var(--v2-primary)]" disabled checked />
                <span className="text-sm font-medium text-[var(--v2-on-surface)] flex-1">Flex Card</span>
                <span className="text-[10px] bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Default</span>
              </label>
            </div>

            {/* Other Cards Grouped */}
            {(() => {
              const categories = [
                { title: '🍔 Food & Drinks', items: ['Food Card', 'Drinks Card'] },
                { title: '👕 Fashion', items: ['Fashion Card'] },
                { title: '📱 Technology', items: ['Electronics Card', 'Gadget Card'] },
                { title: '🛍 Shopping', items: ['Shopping Card'] },
                { title: '🛒 Everyday Use', items: ['Groceries Card', 'Transport Card', 'Fuel Card', 'Bills & Utilities Card'] },
                { title: '🛋 Home & Living', items: ['Furniture Card', 'Home Essentials Card'] },
                { title: '🌟 Lifestyle', items: ['Entertainment Card', 'Educational Card'] },
              ];

              return categories.map(group => {
                const groupCards = allGiftCards.filter((c: any) => c.id !== flexCardId && group.items.includes(c.name));
                if (groupCards.length === 0) return null;

                return (
                  <div key={group.title} className="space-y-2 pt-2 border-t border-gray-100">
                    <h5 className="text-sm font-black text-[var(--v2-on-surface)]">{group.title}</h5>
                    <div className="flex flex-col gap-2.5">
                      {groupCards.map((card: any) => {
                        const checkedCount = acceptedGiftCards.filter((id) => id !== flexCardId).length;
                        const isSelected = acceptedGiftCards.includes(card.id);
                        const isDisabled = !isSelected && checkedCount >= 5;

                        return (
                          <label
                            key={card.id}
                            className={`flex items-center gap-3 py-1 transition-all ${
                              isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded text-[var(--v2-primary)] border-gray-300 focus:ring-[var(--v2-primary)]"
                              disabled={isDisabled}
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (checkedCount < 5) setAcceptedGiftCards([...acceptedGiftCards, card.id]);
                                } else {
                                  setAcceptedGiftCards(acceptedGiftCards.filter((id) => id !== card.id));
                                }
                              }}
                            />
                            <div className="w-3 h-3 rounded-full" style={{ background: `linear-gradient(135deg, ${card.colorFrom}, ${card.colorTo})` }} />
                            <span className="text-sm font-medium text-[var(--v2-on-surface)]">{card.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* SOCIAL LINKS */}
      {/* ═══════════════════════════════════════════ */}
      {activeSection === 'social' && (
        <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">Social Links</h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">Connect your social profiles to your business.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
              <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center">
                <span className="v2-icon text-[#1DA1F2]">alternate_email</span>
              </div>
              <input type="text" value={socialLinks.twitter} onChange={e => setSocialLinks({...socialLinks, twitter: e.target.value})} placeholder="Twitter/X Profile URL" className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
              <div className="w-10 h-10 rounded-full bg-[#E4405F]/10 flex items-center justify-center">
                <span className="v2-icon text-[#E4405F]">photo_camera</span>
              </div>
              <input type="text" value={socialLinks.instagram} onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} placeholder="Instagram Username" className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-surface-container-low)]">
              <div className="w-10 h-10 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center">
                <span className="v2-icon text-[var(--v2-primary)]">language</span>
              </div>
              <input type="text" value={socialLinks.website} onChange={e => setSocialLinks({...socialLinks, website: e.target.value})} placeholder="Personal Website" className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50" />
            </div>
          </div>
        </div>
      )}

      <V2LogoutModal 
        open={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        onConfirm={handleSignOut}
        isLoggingOut={isSaving}
      />
    </div>
  );
}

