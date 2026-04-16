'use client';

import {useProfile} from '@/hooks/use-profile';
import api from '@/lib/api-client';
import {useQueryClient} from '@tanstack/react-query';
import {useState, useEffect} from 'react';
import {toast} from 'sonner';

export function V2VendorShopTab() {
  const {data: profile} = useProfile();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [shopName, setShopName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Nigeria');

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setShopName(profile.shop_name || '');
      setStoreUrl(profile.shop_slug || profile.username || '');
      setDescription(profile.shop_description || profile.bio || '');
      
      if (profile.shop_address) {
        const parts = profile.shop_address.split(', ');
        setAddress(parts[0] || '');
        setCity(parts[1] || '');
        setState(parts[2] || '');
        setPostalCode(parts[3] || '');
      }
      setCountry(profile.country || 'Nigeria');
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Combine address fields into a single shopAddress string
      const fullAddress = [address, city, state, postalCode].filter(Boolean).join(', ');
      
      await api.patch('/users', {
        shopName,
        shopDescription: description,
        shopSlug: storeUrl,
        shopAddress: fullAddress,
        country,
      });

      queryClient.invalidateQueries({queryKey: ['profile']});
      toast.success('Shop details saved successfully');
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error);
      const serverMessage = error.response?.data?.message;
      const displayError = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage;
      toast.error(displayError || error.message || 'Failed to save shop details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (profile) {
      setShopName(profile.shop_name || '');
      setStoreUrl(profile.shop_slug || profile.username || '');
      setDescription(profile.shop_description || profile.bio || '');
      
      if (profile.shop_address) {
        const parts = profile.shop_address.split(', ');
        setAddress(parts[0] || '');
        setCity(parts[1] || '');
        setState(parts[2] || '');
        setPostalCode(parts[3] || '');
      }
      setCountry(profile.country || 'Nigeria');
    }
    toast.info('Changes discarded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)]">
            Shop Details
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] mt-2">
            Manage your brand identity and public storefront information.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleDiscard}
            className="px-6 py-3 bg-[var(--v2-surface-container-high)] text-[var(--v2-primary)] rounded-xl font-bold hover:bg-[var(--v2-surface-container-highest)] transition-colors">
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 v2-hero-gradient text-[var(--v2-on-primary)] rounded-xl font-bold shadow-lg shadow-[var(--v2-primary)]/20 hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Logo Upload */}
        <div className="col-span-12 lg:col-span-4 bg-[var(--v2-surface-container-lowest)] rounded-3xl p-6 md:p-8 flex flex-col items-center text-center">
          <h3 className="w-full text-left text-lg font-bold v2-headline mb-6">Shop Logo</h3>
          <div className="relative group cursor-pointer">
            <div className="w-48 h-48 rounded-2xl overflow-hidden bg-[var(--v2-surface-container-low)] flex items-center justify-center border-2 border-dashed border-[var(--v2-outline-variant)]/30 group-hover:border-[var(--v2-primary)]/50 transition-colors">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Shop Logo"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-60 transition-opacity"
                />
              ) : (
                <span className="v2-icon text-5xl text-[var(--v2-on-surface-variant)]/30">store</span>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="v2-icon text-[var(--v2-primary)] text-4xl">cloud_upload</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium mt-6 leading-relaxed">
            Recommended size: 512x512px.
            <br />
            Supports PNG, JPG, or WEBP.
          </p>
          <button className="mt-6 text-sm font-bold text-[var(--v2-primary)] flex items-center gap-2 hover:underline">
            Change Image
          </button>
        </div>

        {/* Basic Info */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-[var(--v2-surface-container-low)] rounded-3xl p-6 md:p-8 space-y-6 md:space-y-8">
            <h3 className="text-lg font-bold v2-headline">Identity & Presence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--v2-on-surface-variant)] ml-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={e => {
                    const value = e.target.value;
                    setShopName(value);
                    // Automatically generate matching URL slug
                    setStoreUrl(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                  }}
                  className="bg-[var(--v2-surface-container-lowest)] border-none rounded-xl px-4 py-4 text-[var(--v2-on-surface)] shadow-sm focus:ring-1 ring-[var(--v2-outline-variant)]/30 transition-all"
                  placeholder="Your Shop Name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--v2-on-surface-variant)] ml-1">
                  Shop URL
                </label>
                <div className="flex items-center bg-[var(--v2-surface-container-lowest)] rounded-xl px-4 py-4 shadow-sm border-none focus-within:ring-1 ring-[var(--v2-outline-variant)]/30 transition-all">
                  <span className="text-[var(--v2-on-surface-variant)]/60 text-sm">gifthance.com/vendor/</span>
                  <input
                    type="text"
                    value={storeUrl}
                    onChange={e => setStoreUrl(e.target.value)}
                    className="bg-transparent border-none p-0 ml-1 text-[var(--v2-on-surface)] w-full focus:ring-0"
                    placeholder="your-store"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--v2-on-surface-variant)] ml-1">
                Shop Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                className="bg-[var(--v2-surface-container-lowest)] border-none rounded-xl px-4 py-4 text-[var(--v2-on-surface)] shadow-sm focus:ring-1 ring-[var(--v2-outline-variant)]/30 transition-all resize-none leading-relaxed"
                placeholder="Tell customers about your shop..."
              />
              <div className="flex justify-end">
                <span className="text-[10px] font-bold text-[var(--v2-on-surface-variant)]/40 uppercase tracking-tighter">
                  {description.length} / 500 characters
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Address */}
        <div className="col-span-12 bg-[var(--v2-surface-container-low)] rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h3 className="text-lg font-bold v2-headline">Business Address</h3>
              <p className="text-sm text-[var(--v2-on-surface-variant)]">
                This information will be used for shipping and legal documentation.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[var(--v2-primary)] bg-[var(--v2-primary)]/5 px-4 py-2 rounded-full">
              <span className="v2-icon text-sm">verified</span>
              <span className="text-xs font-bold">Verified Address</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            <div className="md:col-span-8 flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--v2-on-surface-variant)] ml-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="bg-[var(--v2-surface-container-lowest)] border-none rounded-xl px-4 py-4 text-[var(--v2-on-surface)] shadow-sm focus:ring-1 ring-[var(--v2-outline-variant)]/30"
                placeholder="123 Main Street, Suite 100"
              />
            </div>
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--v2-on-surface-variant)] ml-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="bg-[var(--v2-surface-container-lowest)] border-none rounded-xl px-4 py-4 text-[var(--v2-on-surface)] shadow-sm focus:ring-1 ring-[var(--v2-outline-variant)]/30"
                placeholder="Lagos"
              />
            </div>
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--v2-on-surface-variant)] ml-1">
                State / Province
              </label>
              <input
                type="text"
                value={state}
                onChange={e => setState(e.target.value)}
                className="bg-[var(--v2-surface-container-lowest)] border-none rounded-xl px-4 py-4 text-[var(--v2-on-surface)] shadow-sm focus:ring-1 ring-[var(--v2-outline-variant)]/30"
                placeholder="Lagos State"
              />
            </div>
            <div className="md:col-span-3 flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--v2-on-surface-variant)] ml-1">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                className="bg-[var(--v2-surface-container-lowest)] border-none rounded-xl px-4 py-4 text-[var(--v2-on-surface)] shadow-sm focus:ring-1 ring-[var(--v2-outline-variant)]/30"
                placeholder="100001"
              />
            </div>
            <div className="md:col-span-5 flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--v2-on-surface-variant)] ml-1">Country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="bg-[var(--v2-surface-container-lowest)] border-none rounded-xl px-4 py-4 text-[var(--v2-on-surface)] shadow-sm focus:ring-1 ring-[var(--v2-outline-variant)]/30 appearance-none">
                <option>Nigeria</option>
                <option>Ghana</option>
                <option>Kenya</option>
                <option>South Africa</option>
                <option>United States</option>
                <option>United Kingdom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="col-span-12 bg-[var(--v2-primary)] rounded-3xl p-6 md:p-10 text-[var(--v2-on-primary)] flex flex-col md:flex-row items-center gap-6 md:gap-10 overflow-hidden relative">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[var(--v2-primary-container)] rounded-full blur-3xl opacity-20" />
          <div className="relative z-10 md:w-2/3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-4 block">
              Public Preview
            </span>
            <h2 className="text-2xl md:text-3xl v2-headline font-extrabold mb-4 leading-tight">
              How your customers see you
            </h2>
            <p className="opacity-90 leading-relaxed max-w-lg mb-6 md:mb-8 text-sm md:text-base">
              Your shop profile is the first impression customers get. We've optimized the layout to
              highlight your unique brand story and high-quality product imagery.
            </p>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-bold border border-white/20">
              <span className="v2-icon">visibility</span>
              View Live Store
            </button>
          </div>
          <div className="relative z-10 md:w-1/3 w-full hidden md:block">
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 transform rotate-3 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-white overflow-hidden p-1">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--v2-surface)] rounded flex items-center justify-center">
                      <span className="v2-icon text-[var(--v2-primary)]">store</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="h-3 w-24 bg-white/40 rounded-full mb-2" />
                  <div className="h-2 w-16 bg-white/20 rounded-full" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-4/5 bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
