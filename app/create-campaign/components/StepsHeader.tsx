'use client';

import {ArrowLeft, CheckCircle} from 'lucide-react';
import Link from 'next/link';

interface StepsHeaderProps {
  steps: string[];
  currentStep: number;
  onBack?: () => void;
}

export function StepsHeader({steps, currentStep, onBack}: StepsHeaderProps) {
  return (
    <>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold font-display text-foreground mb-2">
        Create Campaign
      </h1>
      <p className="text-muted-foreground mb-8">
        Set up your gift campaign in a few simple steps
      </p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                i <= currentStep
                  ? 'bg-gradient-hero text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
              {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i <= currentStep
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              }`}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${i < currentStep ? 'bg-primary' : 'bg-muted'}`}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
