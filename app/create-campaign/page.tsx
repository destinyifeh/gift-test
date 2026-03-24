'use client';

import Navbar from '@/components/landing/Navbar';
import {RequireAuthUI} from '@/components/guards';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {useProfile} from '@/hooks/use-profile';
import {useVendorProducts} from '@/hooks/use-vendor';
import {SUPPORTED_CURRENCIES} from '@/lib/constants/currencies';
// import {allVendorGifts} from '@/lib/data/gifts';
import {
  createCampaign,
  uploadCampaignImage,
} from '@/lib/server/actions/campaigns';
import PaystackPop from '@paystack/inline-js';
import {ArrowLeft, ArrowRight, Loader2, Lock} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';

// Modular Components
import {generateGiftCode} from '@/lib/utils/gift-codes';
import {CategoryStep} from './components/CategoryStep';
import {DetailsStep} from './components/DetailsStep';
import {ReviewStep} from './components/ReviewStep';
import {StepsHeader} from './components/StepsHeader';
import {SuccessScreen} from './components/SuccessScreen';
import {VisibilityStep} from './components/VisibilityStep';

export default function CreateCampaignPage() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const {data: products = []} = useVendorProducts();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [contributorsSeeEachOther, setContributorsSeeEachOther] =
    useState(true);
  const [endDate, setEndDate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const {data: profile, isLoading: isProfileLoading} = useProfile();
  const [currency, setCurrency] = useState('NGN');
  const [hasSetDefaultCurrency, setHasSetDefaultCurrency] = useState(false);

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

  useEffect(() => {
    if (profile) {
      if (!senderEmail && profile.email) setSenderEmail(profile.email);
      if (!senderName && (profile.display_name || profile.username)) {
        setSenderName(profile.display_name || profile.username);
      }
    }
  }, [profile, senderEmail, senderName]);

  const [isLaunching, setIsLaunching] = useState(false);

  // Claimable-specific state
  const [claimableGiftType, setClaimableGiftType] = useState<
    'money' | 'gift-card'
  >('money');
  const [claimableAmount, setClaimableAmount] = useState('');
  const [claimableGiftId, setClaimableGiftId] = useState<number | null>(null);
  const [claimableRecipientType, setClaimableRecipientType] = useState<
    'self' | 'other'
  >('self');
  const [claimableGiftCode, setClaimableGiftCode] = useState('');
  const [createdSlug, setCreatedSlug] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps =
    category === 'claimable'
      ? ['Category', 'Details', 'Review']
      : ['Category', 'Details', 'Visibility', 'Review'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation: Size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      // Validation: Format
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

  const handleLaunch = async () => {
    if (category === 'claimable') {
      // Trigger Paystack for claimable gifts
      const amount =
        claimableGiftType === 'money'
          ? parseFloat(claimableAmount)
          : products.find(p => p.id === claimableGiftId)?.price || 0;

      if (!amount || amount <= 0) {
        toast.error('Invalid amount for gift');
        return;
      }

      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: senderEmail || profile?.email || '',
        amount: Math.round(amount * 100), // convert to kobo
        // currency: currency,
        currency: 'NGN',
        onSuccess: (response: any) => {
          proceedWithLaunch(response.reference);
        },
        onCancel: () => {
          toast.info('Payment cancelled');
        },
      });
    } else {
      proceedWithLaunch();
    }
  };

  const proceedWithLaunch = async (paymentReference?: string) => {
    setIsLaunching(true);
    try {
      let finalImageUrl = image;

      // Handle Image Upload to Supabase if it's a local data URL
      if (image && image.startsWith('data:')) {
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], 'campaign-image.png', {
          type: 'image/png',
        });

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

      let giftCode = '';
      if (category === 'claimable') {
        giftCode = generateGiftCode();
        setClaimableGiftCode(giftCode);
      }

      const campaignData = {
        category,
        title: title || (category === 'claimable' ? 'Gift' : ''),
        description,
        goal_amount: goal
          ? parseFloat(goal)
          : category === 'claimable'
            ? parseFloat(claimableAmount) ||
              products.find(p => p.id === claimableGiftId)?.price
            : undefined,
        min_amount: minAmount ? parseFloat(minAmount) : undefined,
        currency,
        end_date: endDate || undefined,
        visibility,
        contributors_see_each_other: contributorsSeeEachOther,
        claimable_type: claimableGiftType,
        claimable_gift_id: claimableGiftId || undefined,
        claimable_recipient_type: claimableRecipientType,
        status: 'active',
        image_url: finalImageUrl || undefined,
        recipient_email: recipientEmail || undefined,
        sender_email: senderEmail || undefined,
        sender_name: isAnonymous ? 'Anonymous' : senderName || undefined,
        gift_code: giftCode || undefined,
        payment_reference: paymentReference,
      };

      const result = await createCampaign(campaignData);

      if (result.success) {
        if (result.data?.campaign_short_id) {
          setCreatedSlug(result.data.campaign_short_id);
        }
        setSubmitted(true);
        toast.success(
          category === 'claimable'
            ? 'Gift launched successfully! 🎁'
            : 'Campaign launched successfully! 🚀',
        );
      } else {
        toast.error(result.error || 'Failed to launch campaign');
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLaunching(false);
    }
  };

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  if (submitted) {
    return (
      <SuccessScreen
        category={category}
        title={title}
        claimableGiftCode={claimableGiftCode}
        slug={createdSlug}
      />
    );
  }

  return (
    <RequireAuthUI header={<Navbar />} redirectPath="/create-campaign">
      <div className="min-h-screen bg-background">
        <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <StepsHeader steps={steps} currentStep={step} />

          <Card className="border-border">
            <CardContent className="p-6">
              {step === 0 && (
                <CategoryStep
                  selectedCategory={category}
                  onSelect={id => {
                    setCategory(id);
                    if (id === 'claimable') {
                      setVisibility('private');
                    }
                  }}
                />
              )}

              {step === 1 && (
                <DetailsStep
                  category={category}
                  allVendorGifts={products}
                  description={description}
                  setDescription={setDescription}
                  image={image}
                  handleImageUpload={handleImageUpload}
                  onRemoveImage={() => setImage(null)}
                  fileInputRef={fileInputRef}
                  claimable={{
                    giftType: claimableGiftType,
                    setGiftType: setClaimableGiftType,
                    amount: claimableAmount,
                    setAmount: setClaimableAmount,
                    giftId: claimableGiftId,
                    setGiftId: setClaimableGiftId,
                    recipientType: claimableRecipientType,
                    setRecipientType: setClaimableRecipientType,
                    recipientEmail: recipientEmail,
                    setRecipientEmail: setRecipientEmail,
                    senderEmail: senderEmail,
                    setSenderEmail: setSenderEmail,
                    senderName: senderName,
                    setSenderName: setSenderName,
                    isAnonymous: isAnonymous,
                    setIsAnonymous: setIsAnonymous,
                  }}
                  standard={{
                    title,
                    setTitle,
                    goal,
                    setGoal,
                    minAmount,
                    setMinAmount,
                    endDate,
                    setEndDate,
                    currency,
                    setCurrency,
                  }}
                  userCountry={profile?.country}
                />
              )}

              {step === 2 && category !== 'claimable' && (
                <VisibilityStep
                  visibility={visibility}
                  setVisibility={setVisibility}
                  contributorsSeeEachOther={contributorsSeeEachOther}
                  setContributorsSeeEachOther={setContributorsSeeEachOther}
                  category={category}
                />
              )}

              {(step === 3 || (step === 2 && category === 'claimable')) && (
                <ReviewStep
                  category={category}
                  visibility={visibility}
                  image={image}
                  contributorsSeeEachOther={contributorsSeeEachOther}
                  allVendorGifts={products}
                  claimable={{
                    giftType: claimableGiftType,
                    amount: claimableAmount,
                    giftId: claimableGiftId,
                    recipientType: claimableRecipientType,
                    recipientEmail: recipientEmail,
                    senderEmail: senderEmail,
                    senderName: senderName,
                    isAnonymous: isAnonymous,
                  }}
                  standard={{title, goal, endDate, currency}}
                />
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={prev} disabled={step === 0}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                {step < steps.length - 1 ? (
                  <Button variant="hero" onClick={next}>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    onClick={handleLaunch}
                    disabled={isLaunching}>
                    {isLaunching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : category === 'claimable' ? (
                      'Pay & Launch'
                    ) : (
                      'Launch Campaign 🚀'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </RequireAuthUI>
  );
}
