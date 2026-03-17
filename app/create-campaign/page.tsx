'use client';

import Navbar from '@/components/landing/Navbar';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {allVendorGifts} from '@/lib/data/gifts';
import {ArrowLeft, ArrowRight, Loader2} from 'lucide-react';
import {useRef, useState} from 'react';

// Modular Components
import {CategoryStep} from './components/CategoryStep';
import {DetailsStep} from './components/DetailsStep';
import {ReviewStep} from './components/ReviewStep';
import {StepsHeader} from './components/StepsHeader';
import {SuccessScreen} from './components/SuccessScreen';
import {VisibilityStep} from './components/VisibilityStep';

export default function CreateCampaignPage() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [contributorsSeeEachOther, setContributorsSeeEachOther] =
    useState(true);
  const [endDate, setEndDate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [image, setImage] = useState<string | null>(null);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps =
    category === 'claimable'
      ? ['Category', 'Details', 'Review']
      : ['Category', 'Details', 'Visibility', 'Review'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      if (category === 'claimable') {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'GFT-';
        for (let i = 0; i < 5; i++)
          code += chars[Math.floor(Math.random() * chars.length)];
        setClaimableGiftCode(code);
      }
      setIsLaunching(false);
      setSubmitted(true);
    }, 2000);
  };

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  if (submitted) {
    return (
      <SuccessScreen
        category={category}
        title={title}
        claimableGiftCode={claimableGiftCode}
      />
    );
  }

  return (
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
                  allVendorGifts={allVendorGifts}
                  description={description}
                  setDescription={setDescription}
                  image={image}
                  handleImageUpload={handleImageUpload}
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
                  }}
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
                  allVendorGifts={allVendorGifts}
                  claimable={{
                    giftType: claimableGiftType,
                    amount: claimableAmount,
                    giftId: claimableGiftId,
                    recipientType: claimableRecipientType,
                    recipientEmail: recipientEmail,
                  }}
                  standard={{title, goal, endDate}}
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
  );
}
