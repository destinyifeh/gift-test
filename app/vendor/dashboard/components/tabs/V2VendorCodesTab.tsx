'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {useProfile} from '@/hooks/use-profile';
import {useVendorWallet} from '@/hooks/use-vendor';
import {getCurrencyByCountry} from '@/lib/currencies';
import api from '@/lib/api-client';
import {formatCurrency} from '@/lib/utils/currency';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import jsQR from 'jsqr';

type CodeType = 'gift' | 'flex_card' | 'user_gift_card' | null;

interface FlexCardResult {
  id: number;
  code: string;
  balance: number;
  currency: string;
  status: string;
  userName: string;
  userAvatar?: string;
  cardBrand?: string;
}

interface VerificationResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    title: string;
    goalAmount: number;
    currency: string;
    giftCode: string;
    status: string;
    user?: {
      username?: string;
      displayName?: string;
    };
  };
}

const extractErrorMessage = (error: any, fallback: string): string => {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.message) {
      if (Array.isArray(data.message)) return data.message[0];
      return data.message;
    }
    if (data.error) return data.error;
  }
  return error.message || fallback;
};

export function V2VendorCodesTab() {
  const {data: profile} = useProfile();
  const {data: vendorStats} = useVendorWallet();
  const queryClient = useQueryClient();
  const [giftCode, setGiftCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [flexCardResult, setFlexCardResult] = useState<FlexCardResult | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [codeType, setCodeType] = useState<CodeType>(null);
  const [flexRedeemAmount, setFlexRedeemAmount] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const foundCodeRef = useRef<string | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const currency = getCurrencyByCountry(profile?.country || 'Nigeria');

  // Get recent redemptions from vendor stats
  const recentRedemptions = vendorStats?.transactions || [];

  // Check for camera availability
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const hasVideoInput = devices.some(device => device.kind === 'videoinput');
        setHasCamera(hasVideoInput);
      });
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const stopScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
    setIsScanning(false);
  };

  const startScanner = () => {
    foundCodeRef.current = null;
    setShowScanner(true);
  };

  // Initialize camera when scanner modal opens
  useEffect(() => {
    if (!showScanner) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: {ideal: 1280},
            height: {ideal: 720},
          },
        });
        streamRef.current = stream;

        // Wait for video element to be available
        const checkVideo = setInterval(() => {
          if (videoRef.current) {
            clearInterval(checkVideo);
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => {
                // Create canvas for scanning
                canvasRef.current = document.createElement('canvas');
                setIsScanning(true);
                startScanningLoop();
              }).catch(console.error);
            };
          }
        }, 100);

        // Timeout after 3 seconds
        setTimeout(() => clearInterval(checkVideo), 3000);
      } catch (error) {
        console.error('Camera access error:', error);
        toast.error('Unable to access camera. Please check permissions.');
        setShowScanner(false);
      }
    };

    initCamera();
  }, [showScanner]);

  const startScanningLoop = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !streamRef.current) return;
      if (foundCodeRef.current) return; // Already found a code

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Scan for QR code
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (qrCode && qrCode.data) {
        foundCodeRef.current = qrCode.data;
        const code = qrCode.data;

        // Stop scanning
        stopScanner();

        // Set the code and verify
        setGiftCode(code);
        toast.success('QR Code detected!');

        // Verify the code
        handleVerifyCode(code);
      }
    }, 150); // Scan every 150ms
  };

  const handleVerifyCode = async (code: string) => {
    if (!code.trim()) {
      toast.error('Please enter a code');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    setFlexCardResult(null);
    setRedeemError(null);
    setCodeType(null);
    setFlexRedeemAmount('');

    const trimmedCode = code.trim().toUpperCase();
    try {
      // Use the unified verification endpoint for all codes
      const res = await api.post('/vendor/verify-voucher', {code: trimmedCode});
      const result = res.data;

      if (!result) {
        setVerificationResult({
          success: false,
          message: 'Gift code not found or is invalid',
        });
        return;
      }

      // Check if it's a Flex Card or User Gift Card based on the returned type
      if (result.type === 'flex_card' || result.type === 'user_gift_card') {
        setCodeType(result.type as CodeType);
        setFlexCardResult(result);
        const cardName = result.type === 'flex_card' ? 'Flex Card' : (result.cardBrand || 'Gift Card');
        toast.success(`${cardName} verified!`);
        return;
      }

      // Otherwise, assume it's a regular gift
      setCodeType('gift');

      // Check if already redeemed
      if (result.status === 'redeemed') {
        setVerificationResult({
          success: false,
          message: 'This gift code has already been redeemed.',
          data: result,
        });
        toast.error('Gift code already redeemed');
        return;
      }

      // Check if not yet claimed
      if (result.status === 'active' || result.status === 'pending') {
        setVerificationResult({
          success: false,
          message: 'This gift has not been claimed by the recipient yet. They must claim it before it can be redeemed.',
          data: result,
        });
        toast.error('Gift not yet claimed');
        return;
      }

      // Valid code found and ready for redemption
      setVerificationResult({
        success: true,
        message: 'Gift code is valid and ready to redeem',
        data: result,
      });
      toast.success('Gift code verified successfully!');
    } catch (error: any) {
      const msg = extractErrorMessage(error, 'Error verifying code. Please try again.');
      setVerificationResult({
        success: false,
        message: msg,
      });
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || giftCode;
    await handleVerifyCode(code);
  };

  const handleRedeem = async () => {
    if (!verificationResult?.data?.giftCode) return;

    setIsRedeeming(true);
    try {
      const res = await api.post('/vendor/redeem-voucher', {code: verificationResult.data.giftCode});
      const result = res.data;

      if (!result) {
        setVerificationResult({
          success: false,
          message: 'Failed to redeem gift code',
        });
        return;
      }

      toast.success('Gift redeemed successfully!');
      setGiftCode('');
      setVerificationResult(null);
      setCodeType(null);

      // Refresh vendor wallet to update transactions
      queryClient.invalidateQueries({queryKey: ['vendor-wallet']});
    } catch (error: any) {
      const msg = extractErrorMessage(error, 'Failed to redeem gift');
      setRedeemError(msg);
      toast.error(msg);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleFlexCardRedeem = async () => {
    if (!flexCardResult || !flexRedeemAmount || !profile?.id) return;

    const amount = parseFloat(flexRedeemAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > flexCardResult.balance) {
      toast.error(`Amount exceeds available balance of ${formatCurrency(flexCardResult.balance, flexCardResult.currency)}`);
      return;
    }

    setIsRedeeming(true);
    try {
      const endpoint = codeType === 'flex_card' ? '/flex-cards/redeem' : '/user-gift-cards/redeem';
      const cardName = codeType === 'flex_card' ? 'Flex Card' : (flexCardResult.cardBrand || 'Gift Card');
      const res = await api.post(endpoint, {
        code: flexCardResult.code,
        amount,
        description: `${cardName} Payment`,
      });
      const result = res.data;

      if (!result) {
        toast.error('Failed to redeem card');
        return;
      }

      toast.success(`Successfully redeemed ${formatCurrency(amount, flexCardResult.currency)}!`);

      // Show remaining balance
      if (result.newBalance && result.newBalance > 0) {
        toast.info(`Remaining balance: ${formatCurrency(result.newBalance, flexCardResult.currency)}`);
      }

      // Reset state
      setGiftCode('');
      setFlexCardResult(null);
      setFlexRedeemAmount('');
      setCodeType(null);

      // Refresh vendor wallet
      queryClient.invalidateQueries({queryKey: ['vendor-wallet']});
    } catch (error: any) {
      const msg = extractErrorMessage(error, 'Failed to redeem card');
      setRedeemError(msg);
      toast.error(msg);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Hero Header */}
      <div className="relative rounded-2xl md:rounded-[2rem] p-5 md:p-8 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--v2-primary), var(--v2-primary-container))' }}>
        <div className="absolute -right-16 -top-16 w-40 md:w-64 h-40 md:h-64 bg-white/10 rounded-full blur-[60px] md:blur-[80px]" />
        <div className="absolute -left-8 -bottom-8 w-32 md:w-48 h-32 md:h-48 bg-white/5 rounded-full blur-[40px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <span className="v2-icon text-white text-lg md:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
            </div>
            <span className="text-white/70 text-xs md:text-sm font-semibold uppercase tracking-widest">Verification</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white v2-headline tracking-tight mb-1">
            Verify & Redeem
          </h2>
          <p className="text-white/60 text-xs md:text-base max-w-lg">
            Enter a gift code or Flex Card code, or scan a QR to verify and redeem.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
        {/* Verification Input Section */}
        <div className="lg:col-span-7 relative bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-10 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-[var(--v2-primary)]/5 rounded-full blur-3xl" />
          <div className="relative z-10 mb-5 md:mb-8">
            <label className="block text-xs font-bold text-[var(--v2-primary)] uppercase tracking-widest mb-3 md:mb-4">
              Manual Entry
            </label>
            <div className="relative">
              <input
                type="text"
                value={giftCode}
                onChange={e => setGiftCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                className="w-full text-lg md:text-2xl v2-headline font-bold py-4 md:py-6 px-5 md:px-8 bg-[var(--v2-surface-container-low)] border-none rounded-xl md:rounded-2xl focus:ring-2 ring-[var(--v2-primary)]/20 focus:bg-white transition-all text-[var(--v2-on-surface)] placeholder:text-[var(--v2-outline-variant)]/50"
                placeholder="Enter Gift Code"
              />
              {hasCamera && (
                <button
                  onClick={startScanner}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-[var(--v2-primary)]/10 transition-colors">
                  <span
                    className="v2-icon text-[var(--v2-primary)] text-2xl md:text-4xl"
                    style={{fontVariationSettings: "'FILL' 1"}}>
                    qr_code_scanner
                  </span>
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || !giftCode.trim()}
            className="relative z-10 w-full py-4 md:py-6 rounded-xl md:rounded-2xl v2-hero-gradient text-[var(--v2-on-primary)] text-base md:text-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]">
            {isVerifying ? (
              <>
                <span className="v2-icon animate-spin">progress_activity</span>
                Verifying...
              </>
            ) : (
              <>
                <span className="v2-icon">verified</span>
                Verify Code
              </>
            )}
          </button>

          {/* Flex/User Gift Card Result State */}
          {(codeType === 'flex_card' || codeType === 'user_gift_card') && (verificationResult || flexCardResult) && (
            <div className={`mt-6 md:mt-8 p-5 md:p-6 rounded-2xl ${
              flexCardResult
                ? 'bg-[var(--v2-primary-container)]/20 border-2 border-[var(--v2-primary-container)]'
                : verificationResult?.message?.includes('fully redeemed')
                ? 'bg-amber-50 border-2 border-amber-200'
                : 'bg-red-50 border-2 border-dashed border-red-200'
            }`}>
              {flexCardResult ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--v2-primary-container)]/30 text-[var(--v2-primary)] flex items-center justify-center flex-shrink-0">
                      <span className="v2-icon">credit_card</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[var(--v2-on-surface)] tracking-tight">{(flexCardResult as any)?.cardBrand || 'Card'} Verified!</p>
                      <p className="text-[var(--v2-on-surface-variant)] text-sm mb-4">Ready for partial or full redemption</p>
                      
                      <div className="bg-white rounded-xl p-4 mb-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--v2-on-surface-variant)]">Available Balance</span>
                          <span className="text-2xl font-black text-[var(--v2-primary)]">
                            {formatCurrency(flexCardResult.balance, flexCardResult.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--v2-on-surface-variant)]">Cardholder</span>
                          <span className="font-bold">{flexCardResult.userName}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <label className="text-xs font-bold text-[var(--v2-primary)] uppercase tracking-widest">Amount to Charge</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-primary)]/50 font-bold">₦</span>
                          <input
                            type="number"
                            value={flexRedeemAmount}
                            onChange={e => setFlexRedeemAmount(e.target.value)}
                            placeholder="0.00"
                            max={flexCardResult.balance}
                            className="w-full h-14 pl-10 pr-4 text-xl font-bold bg-white rounded-xl border-2 border-[var(--v2-primary-container)] focus:border-[var(--v2-primary)] focus:ring-0 outline-none"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-[var(--v2-primary)] px-1">
                          <span>MAX: {formatCurrency(flexCardResult.balance, flexCardResult.currency)}</span>
                          <button onClick={() => setFlexRedeemAmount(flexCardResult.balance.toString())} className="hover:underline">USE FULL BALANCE</button>
                        </div>
                      </div>

                      <button
                        onClick={handleFlexCardRedeem}
                        disabled={isRedeeming || !flexRedeemAmount || parseFloat(flexRedeemAmount) <= 0 || parseFloat(flexRedeemAmount) > flexCardResult.balance}
                        className="w-full py-4 bg-[var(--v2-primary)] text-white font-bold rounded-xl flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all shadow-lg shadow-[var(--v2-primary)]/20">
                         {isRedeeming ? (
                          <span className="v2-icon animate-spin">progress_activity</span>
                        ) : (
                          <span className="v2-icon">credit_card</span>
                        )}
                        {isRedeeming ? 'Charging...' : `Confirm Charge ${flexRedeemAmount ? formatCurrency(parseFloat(flexRedeemAmount), 'NGN') : ''}`}
                      </button>

                      {redeemError && (
                        <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-200 flex items-start gap-2">
                          <span className="v2-icon text-base shrink-0 mt-0.5">error</span>
                          {redeemError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${verificationResult?.message?.includes('fully redeemed') ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                    <span className="v2-icon">{verificationResult?.message?.includes('fully redeemed') ? 'task_alt' : 'error'}</span>
                  </div>
                  <div>
                    <p className={`font-bold tracking-tight ${verificationResult?.message?.includes('fully redeemed') ? 'text-amber-800' : 'text-red-700'}`}>
                      {verificationResult?.message?.includes('fully redeemed') ? 'Already Redeemed' : 'Card Error'}
                    </p>
                    <p className={`text-sm ${verificationResult?.message?.includes('fully redeemed') ? 'text-amber-700/80' : 'text-red-600/70'}`}>
                      {verificationResult?.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gift Code Result State */}
          {codeType === 'gift' && verificationResult && (
            <div
              className={`mt-6 md:mt-8 p-5 md:p-6 rounded-2xl ${
                verificationResult.success
                  ? 'bg-[var(--v2-secondary-container)]/30 border-2 border-[var(--v2-secondary-container)]'
                  : verificationResult.data?.status === 'redeemed'
                  ? 'bg-amber-50 border-2 border-amber-200'
                  : 'bg-[var(--v2-error-container)]/10 border-2 border-dashed border-[var(--v2-error-container)]'
              }`}>
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    verificationResult.success
                      ? 'bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]'
                      : verificationResult.data?.status === 'redeemed'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                  <span className="v2-icon">
                    {verificationResult.success
                      ? 'check_circle'
                      : verificationResult.data?.status === 'redeemed'
                      ? 'task_alt'
                      : 'error'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--v2-on-surface)] tracking-tight">
                    {verificationResult.success
                      ? 'Code Verified!'
                      : verificationResult.data?.status === 'redeemed'
                      ? 'Already Redeemed'
                      : 'Verification Failed'}
                  </p>
                  <p className="text-[var(--v2-on-surface-variant)] text-sm mb-3">
                    {verificationResult.message}
                  </p>

                  {verificationResult.data && (
                    <div className="mt-4 pt-4 border-t border-black/5 space-y-3">
                      <div className="flex justify-between items-center bg-white/40 p-3 rounded-xl">
                        <span className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-tight">Gift Value</span>
                        <span className="text-xl font-black text-[var(--v2-primary)]">
                          {formatCurrency(verificationResult.data.goalAmount, verificationResult.data.currency || currency)}
                        </span>
                      </div>
                      
                      <div className="px-1 space-y-1">
                        <p className="text-sm text-[var(--v2-on-surface-variant)] flex justify-between">
                          <span className="opacity-60">Item:</span> 
                          <span className="font-bold truncate max-w-[150px]">{verificationResult.data.title || ((codeType as string) === 'flex_card' ? 'Flex Card' : 'Gift Card')}</span>
                        </p>
                        {verificationResult.data.user?.displayName && (
                          <p className="text-sm text-[var(--v2-on-surface-variant)] flex justify-between">
                            <span className="opacity-60">Recipient:</span> 
                            <span className="font-bold">{verificationResult.data.user.displayName}</span>
                          </p>
                        )}
                        <p className="text-sm text-[var(--v2-on-surface-variant)] flex justify-between items-center">
                          <span className="opacity-60">Status:</span> 
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                             verificationResult.data.status === 'redeemed'
                             ? 'bg-amber-100 text-amber-700'
                             : verificationResult.data.status === 'claimed'
                             ? 'bg-emerald-100 text-emerald-800'
                             : 'bg-blue-100 text-blue-800'
                          }`}>
                            {verificationResult.data.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {verificationResult.success && verificationResult.data?.status === 'claimed' && (
                    <button
                      onClick={handleRedeem}
                      disabled={isRedeeming}
                      className="w-full mt-6 py-4 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all shadow-lg shadow-[var(--v2-primary)]/20">
                      {isRedeeming ? (
                        <span className="v2-icon animate-spin">progress_activity</span>
                      ) : (
                        <span className="v2-icon">redeem</span>
                      )}
                      {isRedeeming ? 'Redeeming...' : 'Confirm Redemption'}
                    </button>
                  )}

                  {redeemError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-200 flex items-start gap-2">
                      <span className="v2-icon text-base shrink-0 mt-0.5">error</span>
                      {redeemError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Default State */}
          {!verificationResult && !flexCardResult && (
            <div className="mt-5 md:mt-8 p-4 md:p-6 bg-[var(--v2-secondary-container)]/30 border-2 border-dashed border-[var(--v2-secondary-container)] rounded-xl md:rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--v2-secondary-container)] flex items-center justify-center text-[var(--v2-on-secondary-container)]">
                  <span className="v2-icon">info</span>
                </div>
                <div>
                  <p className="font-bold text-[var(--v2-on-surface)] tracking-tight">
                    Ready for verification
                  </p>
                  <p className="text-[var(--v2-on-surface-variant)] text-sm">
                    Enter a code or scan QR to verify and redeem.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-white rounded-full text-xs font-bold text-[var(--v2-on-surface-variant)] flex items-center gap-1.5">
                  <span className="v2-icon text-sm">redeem</span>
                  Gift Codes
                </span>
                <span className="px-3 py-1.5 bg-[var(--v2-primary-container)]/20 rounded-full text-xs font-bold text-[var(--v2-primary)] flex items-center gap-1.5">
                  <span className="v2-icon text-sm">credit_card</span>
                  Flex Cards (FLEX-XXXX)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Secondary Info Section */}
        <div className="lg:col-span-5 space-y-4 md:space-y-6">
          {/* Scan QR Card */}
          <button
            onClick={startScanner}
            disabled={!hasCamera}
            className="w-full bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-8 overflow-hidden relative text-left disabled:opacity-50 group hover:shadow-xl transition-all active:scale-[0.98]">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--v2-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--v2-primary)]/10 transition-all" />
            <div className="relative z-10">
              <div className="w-11 md:w-14 h-11 md:h-14 rounded-xl md:rounded-2xl bg-[var(--v2-primary)]/10 flex items-center justify-center mb-3 md:mb-4">
                <span className="v2-icon text-xl md:text-2xl text-[var(--v2-primary)]">qr_code_scanner</span>
              </div>
              <h3 className="text-base md:text-xl v2-headline font-bold text-[var(--v2-on-surface)] mb-1 md:mb-2">
                Scan QR Code
              </h3>
              <p className="text-[var(--v2-on-surface-variant)] text-xs md:text-sm">
                {hasCamera
                  ? 'Tap to open camera and scan customer QR code instantly.'
                  : 'Camera not available on this device.'}
              </p>
            </div>
          </button>

          {/* Guidelines Card */}
          <div className="relative bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-8 overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[var(--v2-secondary)]/5 rounded-full blur-3xl" />
            <h3 className="relative z-10 text-base md:text-lg v2-headline font-bold text-[var(--v2-on-surface)] mb-3 md:mb-4">
              Redemption Guide
            </h3>
            <ul className="relative z-10 space-y-3 md:space-y-4">
              <li className="flex items-start gap-3">
                <span className="v2-icon text-[var(--v2-secondary)] text-lg">check_circle</span>
                <span className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
                  <strong>Gift Codes:</strong> Must be claimed by recipient before redemption.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="v2-icon text-[var(--v2-primary)] text-lg">check_circle</span>
                <span className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
                  <strong>Flex Cards:</strong> Support partial redemption. Enter exact purchase amount.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="v2-icon text-[var(--v2-secondary)] text-lg">check_circle</span>
                <span className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
                  Verify the amount matches customer's purchase before confirming.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="v2-icon text-amber-600 text-lg">warning</span>
                <span className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
                  Redemption is permanent and cannot be reversed.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Redemptions */}
      <section className="bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-10 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-[var(--v2-secondary)]/5 rounded-full blur-3xl" />
        <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 mb-5 md:mb-8">
          <div>
            <h3 className="text-lg md:text-2xl v2-headline font-bold text-[var(--v2-on-surface)]">
              Recent Activity
            </h3>
            <p className="text-[var(--v2-on-surface-variant)] text-sm">Your latest successful redemptions</p>
          </div>
          <button 
            onClick={() => setShowAllTransactions(true)}
            className="px-4 py-2 bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] text-xs md:text-sm font-bold rounded-full hover:bg-[var(--v2-primary)]/20 transition-all">
            View all
          </button>
        </div>

        {recentRedemptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30 mb-3">
              receipt_long
            </span>
            <p className="text-[var(--v2-on-surface-variant)]">No redemptions yet</p>
            <p className="text-sm text-[var(--v2-on-surface-variant)]/70">
              Redeemed gift codes will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {recentRedemptions.slice(0, 5).map((redemption: any) => (
              <div
                key={redemption.id}
                className="bg-[var(--v2-surface-container-lowest)] p-4 md:p-5 rounded-2xl flex items-center justify-between gap-3 overflow-hidden">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${redemption.type === 'flex_card' ? 'bg-[var(--v2-primary-container)]/30 text-[var(--v2-primary)]' : 'bg-[var(--v2-secondary-container)]/50 text-[var(--v2-secondary)]'}`}>
                    <span className="v2-icon text-lg">{redemption.type === 'flex_card' ? 'credit_card' : 'check_circle'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[var(--v2-on-surface)] truncate leading-tight">
                      {redemption.desc?.replace(/Payment from .*/i, redemption.type === 'flex_card' ? 'Flex Payment' : (redemption.cardBrand || 'Card Payment'))
                        .replace(/Purchase at .*/i, redemption.type === 'flex_card' ? 'Flex Payment' : (redemption.cardBrand || 'Card Payment')) || 'Redemption'}
                    </p>
                    {redemption.customer && (
                      <p className="text-[9px] text-[var(--v2-primary)] font-bold uppercase tracking-wider mb-0.5">
                        {redemption.customer}
                      </p>
                    )}
                    <p className="text-[10px] text-[var(--v2-on-surface-variant)]">
                      {(() => {
                        const dateVal = redemption.createdAt || redemption.date;
                        if (!dateVal) return 'Date Pending';
                        const d = new Date(dateVal);
                        if (isNaN(d.getTime())) return String(dateVal);
                        return d.toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      })()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 flex flex-col items-end">
                  <p className="text-sm md:text-base font-extrabold text-[var(--v2-on-surface)] whitespace-nowrap">
                    {formatCurrency(redemption.amount, currency)}
                  </p>
                  <span className="px-2 py-0.5 text-[8px] font-bold rounded-full uppercase bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] mt-1">
                    Success
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* All Transactions Modal */}
      <ResponsiveModal open={showAllTransactions} onOpenChange={setShowAllTransactions}>
        <ResponsiveModalContent className="max-w-2xl bg-[var(--v2-surface)]">
          <ResponsiveModalHeader className="pb-4 border-b">
            <ResponsiveModalTitle className="v2-headline text-2xl font-black">All Redemptions</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
            {recentRedemptions.map((redemption: any) => (
              <div
                key={redemption.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--v2-surface-container-low)] gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${redemption.type === 'flex_card' ? 'bg-[var(--v2-primary-container)]/30 text-[var(--v2-primary)]' : 'bg-[var(--v2-secondary-container)]/50 text-[var(--v2-secondary)]'}`}>
                    <span className="v2-icon">{redemption.type === 'flex_card' ? 'credit_card' : 'check_circle'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--v2-on-surface)] truncate">{redemption.desc}</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">{redemption.date}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-[var(--v2-on-surface)]">
                    {formatCurrency(redemption.amount, currency)}
                  </p>
                  <span className="text-[10px] uppercase font-bold text-[var(--v2-secondary)]">Successful</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 mt-2">
            <button 
              onClick={() => setShowAllTransactions(false)}
              className="w-full py-4 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold rounded-xl transition-colors hover:bg-[var(--v2-surface-container-highest)]">
              Close
            </button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* QR Scanner Modal */}
      <ResponsiveModal open={showScanner} onOpenChange={open => !open && stopScanner()}>
        <ResponsiveModalContent className="bg-black md:max-w-lg p-0 overflow-hidden">
          <ResponsiveModalHeader className="bg-black/80 backdrop-blur border-b border-white/10">
            <ResponsiveModalTitle className="text-white">Scan QR Code</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="relative aspect-square bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Scanner overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[var(--v2-primary)] rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[var(--v2-primary)] rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[var(--v2-primary)] rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[var(--v2-primary)] rounded-br-2xl" />
                {/* Scanning line animation */}
                {isScanning && (
                  <div
                    className="absolute left-2 right-2 h-1 bg-[var(--v2-primary)] rounded-full"
                    style={{
                      top: '50%',
                      animation: 'scan-line 2s ease-in-out infinite',
                    }}
                  />
                )}
              </div>
            </div>
            {/* Scanning indicator */}
            {isScanning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--v2-primary)] rounded-full flex items-center gap-2">
                <span className="v2-icon text-white text-sm animate-spin">progress_activity</span>
                <span className="text-white text-xs font-bold">Scanning...</span>
              </div>
            )}
            {/* Instructions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-center text-sm">
                Position the QR code within the frame
              </p>
            </div>
          </div>
          <div className="p-4 bg-black">
            <button
              onClick={stopScanner}
              className="w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors">
              Cancel
            </button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes scan-line {
          0%, 100% { transform: translateY(-100px); opacity: 0.5; }
          50% { transform: translateY(100px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
