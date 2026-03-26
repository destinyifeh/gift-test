'use client';

import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {CAMPAIGN_CATEGORIES} from '@/lib/constants/campaigns';
import {
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
} from '@/lib/constants/currencies';
import {AlertCircle, ArrowLeft, Upload, X} from 'lucide-react';
import React from 'react';

interface DetailsStepProps {
  category: string;
  onBackCategory?: () => void;
  standard: {
    title: string;
    setTitle: (v: string) => void;
    goal: string;
    setGoal: (v: string) => void;
    minAmount: string;
    setMinAmount: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;
    currency: string;
    setCurrency: (v: string) => void;
  };
  description: string;
  setDescription: (v: string) => void;
  image: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  userCountry?: string;
}

export function DetailsStep({
  category,
  onBackCategory,
  standard,
  description,
  setDescription,
  image,
  handleImageUpload,
  onRemoveImage,
  fileInputRef,
  userCountry,
}: DetailsStepProps) {
  const categoryDetails = CAMPAIGN_CATEGORIES.find(c => c.id === category);
  const CategoryIcon = categoryDetails?.icon;

  return (
    <div className="space-y-6">
      {/* Category Header */}
      {categoryDetails && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              {CategoryIcon && <CategoryIcon className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                Selected Category
              </p>
              <p className="font-bold text-foreground">
                {categoryDetails.label}
              </p>
            </div>
          </div>
          {onBackCategory && (
            <button
              onClick={onBackCategory}
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Change
            </button>
          )}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">
          Campaign Details
        </h2>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="title">Campaign Title</Label>
          <Input
            id="title"
            value={standard.title}
            onChange={e => standard.setTitle(e.target.value)}
            placeholder="e.g., Supporting Sarah's Medical Bills"
          />
        </div>
        
        <div>
          <Label htmlFor="desc">Story / Description</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell your supporters why you are raising funds..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="currency">Campaign Currency</Label>
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            This is based on your account country.
          </p>
          <Select
            disabled
            value={standard.currency}
            onValueChange={standard.setCurrency}>
            <SelectTrigger id="currency" className="w-full">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.filter(c => c.canCreate)
                .sort((a, b) => {
                  if (userCountry && a.country === userCountry) return -1;
                  if (userCountry && b.country === userCountry) return 1;
                  return 0;
                })
                .map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>
                        {c.label} ({c.symbol})
                      </span>
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {userCountry &&
            SUPPORTED_CURRENCIES.find(c => c.code === standard.currency)
              ?.country !== userCountry && (
              <div className="flex items-start gap-2 mt-2 p-2 rounded-lg bg-orange-50 border border-orange-100 text-orange-800 text-[10px] sm:text-xs">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <p>
                  You will only be able to withdraw to a{' '}
                  {
                    SUPPORTED_CURRENCIES.find(
                      c => c.code === standard.currency,
                    )?.label
                  }{' '}
                  bank account.
                </p>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="goal">Goal Amount (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                {getCurrencySymbol(standard.currency)}
              </span>
              <Input
                id="goal"
                type="number"
                value={standard.goal}
                onChange={e => standard.setGoal(e.target.value)}
                placeholder="0.00"
                className="pl-12"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="min-amount">Starting From (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                {getCurrencySymbol(standard.currency)}
              </span>
              <Input
                id="min-amount"
                type="number"
                value={standard.minAmount}
                onChange={e => standard.setMinAmount(e.target.value)}
                placeholder="0.00"
                className="pl-12"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="end-date">Campaign Duration / End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={standard.endDate}
              onChange={e => standard.setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="mb-0">Campaign Cover Image</Label>
            <p className="text-xs text-muted-foreground">Optional</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <div
            className={`border-2 border-dashed border-border rounded-xl p-2 text-center hover:border-primary/30 transition-colors cursor-pointer min-h-[180px] flex flex-col items-center justify-center relative overflow-hidden group ${image ? 'bg-muted/30' : ''}`}>
            {image ? (
              <>
                <div className="w-full h-full flex items-center justify-center p-2 rounded-lg bg-black/5">
                  <img
                    src={image}
                    alt="Campaign Preview"
                    className="max-h-[220px] w-auto h-auto object-contain rounded-md shadow-sm transition-transform group-hover:scale-[1.02]"
                    onClick={() => fileInputRef.current?.click()}
                  />
                </div>

                {/* Remove Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onRemoveImage();
                  }}
                  className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-destructive/90 text-destructive-foreground shadow-lg flex items-center justify-center hover:bg-destructive hover:scale-110 transition-all border border-background/20"
                  title="Remove Image">
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-bold text-white whitespace-nowrap">
                    Click image to change
                  </p>
                </div>
              </>
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center"
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-foreground font-semibold">
                  Drag & drop or{' '}
                  <span className="text-primary underline">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended size: 1200x630
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  PNG, JPG, or JPEG (max. 2MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
