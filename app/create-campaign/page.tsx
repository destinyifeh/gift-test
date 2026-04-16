'use client';

import {useIsMobile} from '@/hooks/use-mobile';
import {useProfile} from '@/hooks/use-profile';
import {CAMPAIGN_CATEGORIES} from '@/lib/constants/campaigns';
import {SUPPORTED_CURRENCIES, getCurrencySymbol} from '@/lib/constants/currencies';
import {generateSlug} from '@/lib/utils/slugs';
import {createCampaign, uploadCampaignImage} from '@/lib/server/actions/campaigns';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';

type SectionId = 'category' | 'details' | 'visibility';

// Material Symbols icons mapped to category ids
const CATEGORY_ICONS: Record<string, string> = {
  personal: 'card_giftcard',
  group: 'groups',
  appreciation: 'favorite',
  hobby: 'sports_esports',
  project: 'work',
  support: 'wb_sunny',
  holiday: 'event',
};

export default function CreateCampaignPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {data: profile} = useProfile();

  // Form State
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [contributorsSeeEachOther, setContributorsSeeEachOther] = useState(true);
  const [image, setImage] = useState<string | null>(null);

  // UI State
  const [openSection, setOpenSection] = useState<SectionId>('category');
  const [isLaunching, setIsLaunching] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');
  const [hasSetDefaultCurrency, setHasSetDefaultCurrency] = useState(false);

  // Set default currency based on user's country
  useEffect(() => {
    if (profile?.country && !hasSetDefaultCurrency) {
      const userCurrency = SUPPORTED_CURRENCIES.find(
        c => c.country === profile.country && c.canCreate
      );
      if (userCurrency) {
        setCurrency(userCurrency.code);
      }
      setHasSetDefaultCurrency(true);
    }
  }, [profile, hasSetDefaultCurrency]);

  // Section completion checks
  const isCategoryComplete = !!category;
  const isDetailsComplete = !!title;

  // Get selected category details
  const selectedCategory = CAMPAIGN_CATEGORIES.find(c => c.id === category);

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PNG, JPG, and JPEG formats are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Launch campaign
  const handleLaunch = async () => {
    if (!category) {
      toast.error('Please select a category');
      setOpenSection('category');
      return;
    }
    if (!title) {
      toast.error('Campaign title is required');
      setOpenSection('details');
      return;
    }

    setIsLaunching(true);
    try {
      let finalImageUrl = image;

      // Handle Image Upload
      if (image && image.startsWith('data:')) {
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], 'campaign-image.png', {type: 'image/png'});

        const formData = new FormData();
        formData.append('file', file);

        const uploadResult = await uploadCampaignImage(formData);
        if (uploadResult.success && uploadResult.url) {
          finalImageUrl = uploadResult.url;
        } else {
          toast.error('Image upload failed, using default.');
          finalImageUrl = null;
        }
      }

      const campaignData = {
        category,
        title,
        description,
        goal_amount: goal ? parseFloat(goal) : undefined,
        min_amount: minAmount ? parseFloat(minAmount) : undefined,
        currency,
        end_date: endDate || undefined,
        visibility,
        contributors_see_each_other: contributorsSeeEachOther,
        status: 'active',
        image_url: finalImageUrl || undefined,
      };

      const result = await createCampaign(campaignData);

      if (result.success) {
        if (result.data?.campaign_short_id) {
          setCreatedSlug(result.data.campaign_short_id);
        }
        setSubmitted(true);
        toast.success('Campaign launched successfully!');
      } else {
        toast.error(result.error || 'Failed to launch campaign');
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLaunching(false);
    }
  };

  // Handle section toggle
  const handleSectionToggle = (section: SectionId) => {
    setOpenSection(openSection === section ? ('' as SectionId) : section);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setCategory(categoryId);
    setTimeout(() => setOpenSection('details'), 200);
  };

  if (submitted) {
    return <SuccessScreen title={title} slug={createdSlug} />;
  }

  return (
    <div className="min-h-screen bg-[var(--v2-background)] pb-32 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--v2-surface)]/80 backdrop-blur-xl border-b border-[var(--v2-outline-variant)]/10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-xl hover:bg-[var(--v2-surface-container-high)] transition-colors"
          >
            <span className="v2-icon text-[var(--v2-on-surface)]">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold v2-headline text-[var(--v2-on-surface)] ml-2">
            Create Campaign
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <p className="text-[var(--v2-on-surface-variant)]">
            Start a fundraising campaign for any occasion
          </p>
        </div>

        {/* Form Sections */}
        <div className="space-y-3">
          {/* Category Section */}
          <CollapsibleSection
            title="Campaign Type"
            subtitle={selectedCategory?.label || 'Select a category'}
            badge={selectedCategory?.label}
            stepNumber={1}
            isOpen={openSection === 'category'}
            isCompleted={isCategoryComplete}
            onToggle={() => handleSectionToggle('category')}
          >
            <div className="space-y-2">
              {CAMPAIGN_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.99] ${
                    category === cat.id
                      ? 'bg-[var(--v2-primary)]/5 border-2 border-[var(--v2-primary)]'
                      : 'bg-[var(--v2-surface-container-lowest)] border-2 border-transparent hover:border-[var(--v2-primary)]/40'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      category === cat.id
                        ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                        : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]'
                    }`}
                  >
                    <span className="v2-icon">{CATEGORY_ICONS[cat.id] || 'category'}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`font-semibold text-sm ${
                        category === cat.id
                          ? 'text-[var(--v2-primary)]'
                          : 'text-[var(--v2-on-surface)]'
                      }`}
                    >
                      {cat.label}
                    </p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)] truncate">
                      {cat.desc}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      category === cat.id
                        ? 'border-[var(--v2-primary)] bg-[var(--v2-primary)]'
                        : 'border-[var(--v2-on-surface-variant)]/30'
                    }`}
                  >
                    {category === cat.id && (
                      <div className="w-2 h-2 rounded-full bg-[var(--v2-on-primary)]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Details Section */}
          <CollapsibleSection
            title="Campaign Details"
            subtitle={title || 'Add title, goal, and more'}
            stepNumber={2}
            isOpen={openSection === 'details'}
            isCompleted={isDetailsComplete}
            onToggle={() => handleSectionToggle('details')}
          >
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[var(--v2-on-surface)]">
                  Campaign Title <span className="text-[var(--v2-error)]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Sarah's Birthday Fund"
                  className="w-full h-12 px-4 bg-[var(--v2-surface-container-lowest)] rounded-xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[var(--v2-on-surface)]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell your supporters why you're raising funds..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--v2-surface-container-lowest)] rounded-xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20 resize-none"
                />
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[var(--v2-on-surface)]">
                  Currency
                </label>
                <p className="text-xs text-[var(--v2-on-surface-variant)]">
                  Based on your account country
                </p>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    disabled
                    className="w-full h-12 px-4 bg-[var(--v2-surface-container-lowest)] rounded-xl text-[var(--v2-on-surface)] appearance-none focus:outline-none opacity-70 cursor-not-allowed"
                  >
                    {SUPPORTED_CURRENCIES.filter(c => c.canCreate).map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.label} ({c.symbol})
                      </option>
                    ))}
                  </select>
                  <span className="v2-icon absolute right-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Goal & Min Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[var(--v2-on-surface)]">
                    Goal Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] font-medium">
                      {getCurrencySymbol(currency)}
                    </span>
                    <input
                      type="number"
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 pl-10 pr-4 bg-[var(--v2-surface-container-lowest)] rounded-xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[var(--v2-on-surface)]">
                    Min. Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] font-medium">
                      {getCurrencySymbol(currency)}
                    </span>
                    <input
                      type="number"
                      value={minAmount}
                      onChange={e => setMinAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 pl-10 pr-4 bg-[var(--v2-surface-container-lowest)] rounded-xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20"
                    />
                  </div>
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[var(--v2-on-surface)]">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full h-12 px-4 bg-[var(--v2-surface-container-lowest)] rounded-xl text-[var(--v2-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-[var(--v2-on-surface)]">
                    Cover Image
                  </label>
                  <span className="text-xs text-[var(--v2-on-surface-variant)]">Optional</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors min-h-[120px] flex flex-col items-center justify-center relative ${
                    image
                      ? 'border-[var(--v2-primary)]/30 bg-[var(--v2-primary)]/5'
                      : 'border-[var(--v2-outline-variant)]/30 hover:border-[var(--v2-primary)]/40'
                  }`}
                >
                  {image ? (
                    <div className="relative w-full">
                      <img
                        src={image}
                        alt="Preview"
                        className="max-h-[160px] w-auto mx-auto rounded-xl object-contain"
                      />
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setImage(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[var(--v2-error)] text-[var(--v2-on-error)] flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <span className="v2-icon text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="v2-icon text-3xl text-[var(--v2-on-surface-variant)] mb-2">
                        cloud_upload
                      </span>
                      <p className="text-sm text-[var(--v2-on-surface)] font-medium">
                        Tap to upload
                      </p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] mt-1">
                        PNG, JPG up to 2MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setOpenSection('visibility')}
                className="w-full h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl transition-transform active:scale-[0.98]"
              >
                Continue to Visibility
              </button>
            </div>
          </CollapsibleSection>

          {/* Visibility Section */}
          <CollapsibleSection
            title="Visibility"
            subtitle={visibility === 'public' ? 'Public campaign' : 'Private campaign'}
            stepNumber={3}
            isOpen={openSection === 'visibility'}
            isCompleted={true}
            onToggle={() => handleSectionToggle('visibility')}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <VisibilityOption
                  type="public"
                  isSelected={visibility === 'public'}
                  onSelect={() => setVisibility('public')}
                />
                <VisibilityOption
                  type="private"
                  isSelected={visibility === 'private'}
                  onSelect={() => setVisibility('private')}
                />
              </div>

              {visibility === 'private' && (
                <div className="bg-[var(--v2-surface-container-highest)] rounded-xl p-4 space-y-3">
                  <p className="font-semibold text-[var(--v2-on-surface)] text-sm">
                    Privacy Settings
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contributorsSeeEachOther}
                      onChange={e => setContributorsSeeEachOther(e.target.checked)}
                      className="w-5 h-5 rounded accent-[var(--v2-primary)] mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-sm text-[var(--v2-on-surface)]">
                        Contributors can see each other
                      </p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                        Social campaign feel
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer border-t border-[var(--v2-outline-variant)]/20 pt-3">
                    <input
                      type="checkbox"
                      checked={!contributorsSeeEachOther}
                      onChange={e => setContributorsSeeEachOther(!e.target.checked)}
                      className="w-5 h-5 rounded accent-[var(--v2-primary)] mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-sm text-[var(--v2-on-surface)]">
                        Fully private
                      </p>
                      <p className="text-xs text-[var(--v2-on-surface-variant)]">
                        No one sees other contributors
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>
      </main>

      {/* Sticky CTA Footer */}
      {isMobile ? (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--v2-surface)]/90 backdrop-blur-xl border-t border-[var(--v2-outline-variant)]/10 pb-safe">
          <button
            onClick={handleLaunch}
            disabled={isLaunching || !category || !title}
            className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[var(--v2-primary)]/20"
          >
            {isLaunching ? (
              <>
                <span className="v2-icon animate-spin">progress_activity</span>
                Creating...
              </>
            ) : (
              'Launch Campaign 🚀'
            )}
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 mt-6">
          <button
            onClick={handleLaunch}
            disabled={isLaunching || !category || !title}
            className="w-full h-14 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isLaunching ? (
              <>
                <span className="v2-icon animate-spin">progress_activity</span>
                Creating Campaign...
              </>
            ) : (
              'Launch Campaign 🚀'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  subtitle: string;
  badge?: string;
  stepNumber: number;
  isOpen: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  subtitle,
  badge,
  stepNumber,
  isOpen,
  isCompleted,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div
      className={`bg-[var(--v2-surface-container-low)] rounded-[1.25rem] overflow-hidden transition-colors ${
        isOpen ? '' : 'hover:bg-[var(--v2-surface-container)]'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              isCompleted
                ? 'bg-[var(--v2-secondary)] text-[var(--v2-on-secondary)]'
                : isOpen
                  ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                  : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]'
            }`}
          >
            {isCompleted ? (
              <span className="v2-icon text-sm">check</span>
            ) : (
              stepNumber
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--v2-on-surface)]">{title}</h3>
              {badge && (
                <span className="text-[10px] bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] px-2 py-0.5 rounded-full font-bold">
                  {badge}
                </span>
              )}
            </div>
            {!isOpen && (
              <p className="text-sm text-[var(--v2-on-surface-variant)] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <span
          className={`v2-icon text-[var(--v2-on-surface-variant)] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0">
          <div className="pt-2 border-t border-[var(--v2-outline-variant)]/10">{children}</div>
        </div>
      )}
    </div>
  );
}

function VisibilityOption({
  type,
  isSelected,
  onSelect,
}: {
  type: 'public' | 'private';
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isPublic = type === 'public';

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.99] ${
        isSelected
          ? 'bg-[var(--v2-primary)]/5 border-2 border-[var(--v2-primary)]'
          : 'bg-[var(--v2-surface-container-lowest)] border-2 border-transparent hover:border-[var(--v2-primary)]/40'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isSelected
            ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
            : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)]'
        }`}
      >
        <span className="v2-icon">{isPublic ? 'public' : 'lock'}</span>
      </div>
      <div className="flex-1 text-left">
        <p
          className={`font-semibold text-sm ${
            isSelected ? 'text-[var(--v2-primary)]' : 'text-[var(--v2-on-surface)]'
          }`}
        >
          {isPublic ? 'Public Campaign' : 'Private Campaign'}
        </p>
        <p className="text-xs text-[var(--v2-on-surface-variant)]">
          {isPublic ? 'Anyone can view and contribute' : 'Only people with link can view'}
        </p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          isSelected
            ? 'border-[var(--v2-primary)] bg-[var(--v2-primary)]'
            : 'border-[var(--v2-on-surface-variant)]/30'
        }`}
      >
        {isSelected && <div className="w-2 h-2 rounded-full bg-[var(--v2-on-primary)]" />}
      </div>
    </button>
  );
}

function SuccessScreen({title, slug}: {title: string; slug: string}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const campaignLink = `${origin}/campaigns/${slug}/${generateSlug(title)}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Gift Campaign',
          text: `Check out my gift campaign: ${title}`,
          url: campaignLink,
        });
      } catch {
        navigator.clipboard.writeText(campaignLink);
        toast.success('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(campaignLink);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(campaignLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--v2-background)] pb-32 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--v2-surface)]/80 backdrop-blur-xl border-b border-[var(--v2-outline-variant)]/10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span
              className="v2-icon text-2xl text-[var(--v2-primary)]"
              style={{fontVariationSettings: "'FILL' 1"}}
            >
              card_giftcard
            </span>
            <span className="text-lg font-bold v2-headline text-[var(--v2-on-surface)]">
              Gifthance
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[var(--v2-secondary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span
              className="v2-icon text-4xl text-[var(--v2-secondary)]"
              style={{fontVariationSettings: "'FILL' 1"}}
            >
              check_circle
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold v2-headline text-[var(--v2-on-surface)] mb-2">
            Campaign Created! 🎉
          </h1>
          <p className="text-[var(--v2-on-surface-variant)]">
            Share your campaign and start receiving contributions
          </p>
        </div>

        {/* Campaign Link Card */}
        <div className="bg-[var(--v2-surface-container-low)] rounded-[1.5rem] p-5 mb-4">
          <label className="text-xs uppercase tracking-wider text-[var(--v2-on-surface-variant)] font-bold mb-2 block">
            Campaign Link
          </label>
          <div className="flex items-center gap-2 bg-[var(--v2-surface-container-lowest)] rounded-xl px-4 py-3 mb-4">
            <span className="v2-icon text-[var(--v2-on-surface-variant)]">link</span>
            <span className="font-mono text-sm text-[var(--v2-on-surface)] truncate flex-1">
              {campaignLink}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={`flex-1 h-12 flex items-center justify-center gap-2 font-bold rounded-2xl transition-colors ${
                copied
                  ? 'bg-[var(--v2-secondary)]/10 text-[var(--v2-secondary)] border-2 border-[var(--v2-secondary)]'
                  : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] border-2 border-transparent'
              }`}
            >
              <span className="v2-icon">{copied ? 'check_circle' : 'content_copy'}</span>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl flex items-center justify-center gap-2"
            >
              <span className="v2-icon">share</span>
              Share
            </button>
          </div>
        </div>

        {/* Invite Section */}
        <div className="bg-[var(--v2-surface-container-low)] rounded-[1.5rem] p-5 mb-4">
          <label className="text-xs uppercase tracking-wider text-[var(--v2-on-surface-variant)] font-bold mb-3 block">
            Invite Contributors
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter emails separated by commas"
              className="flex-1 h-12 px-4 bg-[var(--v2-surface-container-lowest)] rounded-xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--v2-primary)]/20"
            />
            <button className="h-12 px-6 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl flex items-center justify-center gap-2 shrink-0">
              <span className="v2-icon">send</span>
              Send
            </button>
          </div>
        </div>

        {/* Actions */}
        {isMobile ? (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--v2-surface)]/90 backdrop-blur-xl border-t border-[var(--v2-outline-variant)]/10 pb-safe">
            <div className="flex gap-3">
              <Link href={`/campaign/${slug}/${generateSlug(title)}`} className="flex-1">
                <button className="w-full h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl">
                  View Campaign
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="h-12 px-6 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold rounded-2xl">
                  Dashboard
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link href={`/campaign/${slug}/${generateSlug(title)}`} className="flex-1">
              <button className="w-full h-12 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-2xl">
                View Campaign
              </button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <button className="w-full h-12 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold rounded-2xl hover:bg-[var(--v2-surface-container-highest)] transition-colors">
                Go to Dashboard
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
