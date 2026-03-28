'use client';

import {RequireAuthUI} from '@/components/guards';
import Navbar from '@/components/landing/Navbar';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {StickyFooter} from '@/components/ui/sticky-footer';
import {Textarea} from '@/components/ui/textarea';
import {useIsMobile} from '@/hooks/use-mobile';
import {useProfile} from '@/hooks/use-profile';
import {CAMPAIGN_CATEGORIES} from '@/lib/constants/campaigns';
import {
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
} from '@/lib/constants/currencies';
import {cn} from '@/lib/utils';
import {generateSlug} from '@/lib/utils/slugs';
import {
  createCampaign,
  uploadCampaignImage,
} from '@/lib/server/actions/campaigns';
import {AnimatePresence, motion} from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronDown,
  Copy,
  Globe,
  Link as LinkIcon,
  Loader2,
  Lock,
  Plus,
  SendHorizontal,
  Upload,
  X,
} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';

// Types
type SectionId = 'category' | 'details' | 'visibility';

interface FormSectionProps {
  id: SectionId;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}

// Collapsible Form Section Component
function FormSection({
  id,
  title,
  subtitle,
  isOpen,
  isCompleted,
  onToggle,
  children,
  badge,
}: FormSectionProps) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between p-4 md:p-5',
          'text-left transition-colors min-h-[64px]',
          isOpen ? 'bg-muted/30' : 'hover:bg-muted/20',
        )}>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
              isCompleted
                ? 'bg-secondary text-secondary-foreground'
                : isOpen
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
            )}>
            {isCompleted ? <Check className="w-4 h-4" /> : id === 'category' ? '1' : id === 'details' ? '2' : '3'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {badge && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && !isOpen && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: 'auto', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.2}}>
            <div className="p-4 md:p-5 pt-0 md:pt-0 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Category List Item with Radio
function CategoryListItem({
  category,
  isSelected,
  onSelect,
}: {
  category: (typeof CAMPAIGN_CATEGORIES)[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = category.icon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
        'active:scale-[0.99] min-h-[56px]',
        isSelected
          ? 'bg-primary/5 border border-primary'
          : 'bg-card border border-border hover:border-primary/40',
      )}>
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={cn('font-medium text-sm', isSelected ? 'text-primary' : 'text-foreground')}>
          {category.label}
        </p>
        <p className="text-xs text-muted-foreground truncate">{category.desc}</p>
      </div>
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30',
        )}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
      </div>
    </button>
  );
}

// Visibility List Item with Radio
function VisibilityListItem({
  type,
  isSelected,
  onSelect,
}: {
  type: 'public' | 'private';
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isPublic = type === 'public';
  const Icon = isPublic ? Globe : Lock;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
        'active:scale-[0.99] min-h-[56px]',
        isSelected
          ? 'bg-primary/5 border border-primary'
          : 'bg-card border border-border hover:border-primary/40',
      )}>
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={cn('font-medium text-sm', isSelected ? 'text-primary' : 'text-foreground')}>
          {isPublic ? 'Public Campaign' : 'Private Campaign'}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {isPublic ? 'Anyone can view and contribute' : 'Only people with link can view'}
        </p>
      </div>
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30',
        )}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
      </div>
    </button>
  );
}

// Success Screen Component
function SuccessScreen({title, slug}: {title: string; slug: string}) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const campaignLink = `${origin}/campaign/${slug}/${generateSlug(title)}`;

  const handleShare = async () => {
    const shareText = `Check out my gift campaign: ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Gift Campaign',
          text: shareText,
          url: campaignLink,
        });
      } catch (error) {
        console.log('Error sharing:', error);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-32 md:pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{scale: 0}}
              animate={{scale: 1}}
              transition={{type: 'spring', stiffness: 200, damping: 15}}
              className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-secondary" />
            </motion.div>
            <motion.h1
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.2}}
              className="text-2xl md:text-3xl font-bold font-display text-foreground mb-2">
              Campaign Created! 🎉
            </motion.h1>
            <motion.p
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.3}}
              className="text-muted-foreground">
              Share your campaign and start receiving contributions
            </motion.p>
          </div>

          {/* Campaign Link Card */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.4}}
            className="bg-card rounded-2xl border border-border p-4 md:p-6 space-y-4 mb-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                Campaign Link
              </Label>
              <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3 border border-border">
                <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="font-mono text-sm text-foreground truncate flex-1">
                  {campaignLink}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  'flex-1 h-12',
                  copied && 'border-green-500 text-green-600',
                )}
                onClick={handleCopy}>
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" /> Copy Link
                  </>
                )}
              </Button>
              <Button variant="hero" size="lg" className="flex-1 h-12" onClick={handleShare}>
                <Plus className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </motion.div>

          {/* Invite Section */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.5}}
            className="bg-card rounded-2xl border border-border p-4 md:p-6 space-y-4 mb-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Invite Contributors
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Enter emails separated by commas"
                className="bg-muted border-border h-12"
              />
              <Button variant="hero" size="lg" className="shrink-0 h-12">
                <SendHorizontal className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </motion.div>

          {/* Actions - Fixed on mobile */}
          {isMobile ? (
            <StickyFooter className="bg-background border-t border-border">
              <div className="flex gap-3">
                <Link href={`/campaign/${slug}/${generateSlug(title)}`} className="flex-1">
                  <Button variant="hero" size="lg" className="w-full h-12">
                    View Campaign
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="h-12">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </StickyFooter>
          ) : (
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.6}}
              className="flex gap-3">
              <Link href={`/campaign/${slug}/${generateSlug(title)}`} className="flex-1">
                <Button variant="hero" size="lg" className="w-full h-12">
                  View Campaign
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" size="lg" className="w-full h-12">
                  Go to Dashboard
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Page Component
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
        c => c.country === profile.country && c.canCreate,
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
  const isVisibilityComplete = true; // Always has a default

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
        toast.success('Campaign launched successfully! 🚀');
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
    if (openSection === section) {
      // Close the section - don't open any
      setOpenSection('' as SectionId);
    } else {
      setOpenSection(section);
    }
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
    <RequireAuthUI header={<Navbar />} redirectPath="/create-campaign">
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 md:pt-24 pb-32 md:pb-16">
          <div className="container mx-auto px-4 max-w-xl">
            {/* Page Header */}
            <div className="mb-6 md:mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                Create Campaign
              </h1>
              <p className="text-muted-foreground mt-1">
                Start a fundraising campaign for any occasion
              </p>
            </div>

            {/* Form Sections */}
            <div className="space-y-3 md:space-y-4">
              {/* Category Section */}
              <FormSection
                id="category"
                title="Campaign Type"
                subtitle={selectedCategory?.label || 'Select a category'}
                isOpen={openSection === 'category'}
                isCompleted={isCategoryComplete}
                onToggle={() => handleSectionToggle('category')}
                badge={selectedCategory?.label}>
                <div className="space-y-2">
                  {CAMPAIGN_CATEGORIES.map(cat => (
                    <CategoryListItem
                      key={cat.id}
                      category={cat}
                      isSelected={category === cat.id}
                      onSelect={() => handleCategorySelect(cat.id)}
                    />
                  ))}
                </div>
              </FormSection>

              {/* Details Section */}
              <FormSection
                id="details"
                title="Campaign Details"
                subtitle={title || 'Add title, goal, and more'}
                isOpen={openSection === 'details'}
                isCompleted={isDetailsComplete}
                onToggle={() => handleSectionToggle('details')}>
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Campaign Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g., Sarah's Birthday Fund"
                      className="h-12 mt-1.5"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Tell your supporters why you're raising funds..."
                      rows={3}
                      className="mt-1.5 resize-none"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Based on your account country
                    </p>
                    <Select disabled value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency" className="h-12">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.filter(c => c.canCreate).map(c => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span>{c.label} ({c.symbol})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {profile?.country &&
                      SUPPORTED_CURRENCIES.find(c => c.code === currency)?.country !== profile.country && (
                        <div className="flex items-start gap-2 mt-2 p-2 rounded-lg bg-orange-50 border border-orange-100 text-orange-800 text-xs">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>
                            You can only withdraw to a{' '}
                            {SUPPORTED_CURRENCIES.find(c => c.code === currency)?.label} bank account.
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Goal & Min Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="goal">Goal Amount</Label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                          {getCurrencySymbol(currency)}
                        </span>
                        <Input
                          id="goal"
                          type="number"
                          value={goal}
                          onChange={e => setGoal(e.target.value)}
                          placeholder="0.00"
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="min-amount">Min. Amount</Label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                          {getCurrencySymbol(currency)}
                        </span>
                        <Input
                          id="min-amount"
                          type="number"
                          value={minAmount}
                          onChange={e => setMinAmount(e.target.value)}
                          placeholder="0.00"
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <Label htmlFor="end-date">End Date (Optional)</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="h-12 mt-1.5"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label>Cover Image</Label>
                      <span className="text-xs text-muted-foreground">Optional</span>
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
                      className={cn(
                        'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors min-h-[120px] flex flex-col items-center justify-center relative',
                        image
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border hover:border-primary/40',
                      )}>
                      {image ? (
                        <div className="relative w-full">
                          <img
                            src={image}
                            alt="Preview"
                            className="max-h-[160px] w-auto mx-auto rounded-lg object-contain"
                          />
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setImage(null);
                            }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-110 transition-transform">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-foreground font-medium">
                            Tap to upload
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 2MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Continue Button */}
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full h-12 mt-2"
                    onClick={() => setOpenSection('visibility')}>
                    Continue to Visibility
                  </Button>
                </div>
              </FormSection>

              {/* Visibility Section */}
              <FormSection
                id="visibility"
                title="Visibility"
                subtitle={visibility === 'public' ? 'Public campaign' : 'Private campaign'}
                isOpen={openSection === 'visibility'}
                isCompleted={isVisibilityComplete}
                onToggle={() => handleSectionToggle('visibility')}>
                <div className="space-y-4">
                  {/* Visibility Options */}
                  <div className="space-y-2">
                    <VisibilityListItem
                      type="public"
                      isSelected={visibility === 'public'}
                      onSelect={() => setVisibility('public')}
                    />
                    <VisibilityListItem
                      type="private"
                      isSelected={visibility === 'private'}
                      onSelect={() => setVisibility('private')}
                    />
                  </div>

                  {/* Private Options */}
                  <AnimatePresence>
                    {visibility === 'private' && (
                      <motion.div
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: 'auto'}}
                        exit={{opacity: 0, height: 0}}
                        className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border">
                        <p className="font-medium text-foreground text-sm">
                          Privacy Settings
                        </p>
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <Checkbox
                              checked={contributorsSeeEachOther}
                              onCheckedChange={v => setContributorsSeeEachOther(!!v)}
                              className="mt-0.5"
                            />
                            <div>
                              <p className="font-medium text-sm">Contributors can see each other</p>
                              <p className="text-xs text-muted-foreground">
                                Social campaign feel
                              </p>
                            </div>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <Checkbox
                              checked={!contributorsSeeEachOther}
                              onCheckedChange={v => setContributorsSeeEachOther(!v)}
                              className="mt-0.5"
                            />
                            <div>
                              <p className="font-medium text-sm">Fully private</p>
                              <p className="text-xs text-muted-foreground">
                                No one sees other contributors
                              </p>
                            </div>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FormSection>
            </div>

            {/* Sticky CTA Footer */}
            {isMobile ? (
              <StickyFooter className="bg-background border-t border-border">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full h-14 text-base font-semibold"
                  disabled={isLaunching || !category || !title}
                  onClick={handleLaunch}>
                  {isLaunching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Launch Campaign 🚀'
                  )}
                </Button>
              </StickyFooter>
            ) : (
              <div className="mt-6">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full h-14 text-base font-semibold"
                  disabled={isLaunching || !category || !title}
                  onClick={handleLaunch}>
                  {isLaunching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    'Launch Campaign 🚀'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuthUI>
  );
}
