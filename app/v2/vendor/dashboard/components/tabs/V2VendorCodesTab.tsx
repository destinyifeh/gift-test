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
import {verifyVoucherCode, redeemVoucherCode} from '@/lib/server/actions/vendor';
import {formatCurrency} from '@/lib/utils/currency';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import jsQR from 'jsqr';

interface VerificationResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    title: string;
    goal_amount: number;
    currency: string;
    gift_code: string;
    status: string;
    profiles?: {
      username?: string;
      display_name?: string;
    };
  };
}

export function V2VendorCodesTab() {
  const {data: profile} = useProfile();
  const {data: vendorStats} = useVendorWallet();
  const queryClient = useQueryClient();
  const [giftCode, setGiftCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const foundCodeRef = useRef<string | null>(null);

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
      toast.error('Please enter a gift code');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyVoucherCode(code.trim());

      if (!result.success) {
        setVerificationResult({
          success: false,
          message: result.error || 'Gift code not found or is invalid',
        });
        toast.error(result.error || 'Invalid gift code');
        return;
      }

      // Check if already redeemed
      if (result.data?.status === 'redeemed') {
        setVerificationResult({
          success: false,
          message: 'This gift code has already been redeemed.',
          data: result.data,
        });
        toast.error('Gift code already redeemed');
        return;
      }

      // Check if not yet claimed
      if (result.data?.status === 'active' || result.data?.status === 'pending') {
        setVerificationResult({
          success: false,
          message: 'This gift has not been claimed by the recipient yet. They must claim it before it can be redeemed.',
          data: result.data,
        });
        toast.error('Gift not yet claimed');
        return;
      }

      // Valid code found and ready for redemption
      setVerificationResult({
        success: true,
        message: 'Gift code is valid and ready to redeem',
        data: result.data,
      });
      toast.success('Gift code verified successfully!');
    } catch (error) {
      setVerificationResult({
        success: false,
        message: 'Error verifying gift code. Please try again.',
      });
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || giftCode;
    await handleVerifyCode(code);
  };

  const handleRedeem = async () => {
    if (!verificationResult?.data?.gift_code) return;

    setIsRedeeming(true);
    try {
      const result = await redeemVoucherCode(verificationResult.data.gift_code);

      if (!result.success) {
        toast.error(result.error || 'Failed to redeem gift');
        return;
      }

      toast.success('Gift redeemed successfully!');
      setGiftCode('');
      setVerificationResult(null);

      // Refresh vendor wallet to update transactions
      queryClient.invalidateQueries({queryKey: ['vendor-wallet']});
    } catch (error) {
      toast.error('Failed to redeem gift');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)] mb-2">
          Verify Gift Code
        </h2>
        <p className="text-[var(--v2-on-surface-variant)] text-base md:text-lg">
          Enter the unique gift code or scan the customer's QR code to proceed with redemption.
        </p>
      </div>

      {/* Bento Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Verification Input Section */}
        <div className="col-span-12 lg:col-span-7 bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6 md:p-10 shadow-[0_20px_40px_rgba(73,38,4,0.06)]">
          <div className="mb-6 md:mb-8">
            <label className="block text-sm font-bold text-[var(--v2-primary)] uppercase tracking-widest mb-4">
              Manual Entry
            </label>
            <div className="relative">
              <input
                type="text"
                value={giftCode}
                onChange={e => setGiftCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                className="w-full text-xl md:text-2xl v2-headline font-bold py-5 md:py-6 px-6 md:px-8 bg-[var(--v2-surface-container-low)] border-none rounded-2xl focus:ring-2 ring-[var(--v2-primary)]/20 focus:bg-white transition-all text-[var(--v2-on-surface)] placeholder:text-[var(--v2-outline-variant)]/50"
                placeholder="Enter Gift Code"
              />
              {hasCamera && (
                <button
                  onClick={startScanner}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-[var(--v2-primary)]/10 transition-colors">
                  <span
                    className="v2-icon text-[var(--v2-primary)] text-3xl md:text-4xl"
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
            className="w-full py-5 md:py-6 rounded-2xl v2-hero-gradient text-[var(--v2-on-primary)] text-lg md:text-xl font-bold shadow-[0_20px_40px_rgba(73,38,4,0.06)] hover:opacity-90 transition-opacity flex items-center justify-center gap-3 disabled:opacity-50">
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

          {/* Result State */}
          {verificationResult && (
            <div
              className={`mt-6 md:mt-8 p-5 md:p-6 rounded-2xl ${
                verificationResult.success
                  ? 'bg-[var(--v2-secondary-container)]/30 border-2 border-[var(--v2-secondary-container)]'
                  : verificationResult.data?.status === 'redeemed'
                  ? 'bg-amber-100/50 border-2 border-amber-300'
                  : 'bg-[var(--v2-error-container)]/10 border-2 border-dashed border-[var(--v2-error-container)]'
              }`}>
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    verificationResult.success
                      ? 'bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]'
                      : verificationResult.data?.status === 'redeemed'
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-[var(--v2-error-container)]/20 text-[var(--v2-error)]'
                  }`}>
                  <span className="v2-icon">
                    {verificationResult.success
                      ? 'check_circle'
                      : verificationResult.data?.status === 'redeemed'
                      ? 'task_alt'
                      : 'error'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[var(--v2-on-surface)] tracking-tight">
                    {verificationResult.success
                      ? 'Code Verified!'
                      : verificationResult.data?.status === 'redeemed'
                      ? 'Already Redeemed'
                      : 'Verification Failed'}
                  </p>
                  <p className="text-[var(--v2-on-surface-variant)] text-sm">
                    {verificationResult.message}
                  </p>
                  {verificationResult.data && (
                    <div className="mt-3 space-y-2">
                      <p className="text-lg font-bold text-[var(--v2-primary)]">
                        Value: {formatCurrency(verificationResult.data.goal_amount, verificationResult.data.currency || currency)}
                      </p>
                      <p className="text-sm text-[var(--v2-on-surface-variant)]">
                        <span className="font-medium">Gift:</span> {verificationResult.data.title || 'Gift Card'}
                      </p>
                      {verificationResult.data.profiles?.display_name && (
                        <p className="text-sm text-[var(--v2-on-surface-variant)]">
                          <span className="font-medium">Recipient:</span> {verificationResult.data.profiles.display_name}
                        </p>
                      )}
                      {verificationResult.data.status && (
                        <p className="text-sm">
                          <span className="font-medium text-[var(--v2-on-surface-variant)]">Status:</span>{' '}
                          <span className={`font-bold uppercase text-xs px-2 py-0.5 rounded-full ${
                            verificationResult.data.status === 'redeemed'
                              ? 'bg-amber-200 text-amber-800'
                              : verificationResult.data.status === 'claimed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {verificationResult.data.status}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {verificationResult.success && verificationResult.data?.status === 'claimed' && (
                <button
                  onClick={handleRedeem}
                  disabled={isRedeeming}
                  className="w-full mt-4 px-6 py-4 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                  {isRedeeming ? (
                    <>
                      <span className="v2-icon animate-spin">progress_activity</span>
                      Redeeming...
                    </>
                  ) : (
                    <>
                      <span className="v2-icon">redeem</span>
                      Redeem Now
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Default State */}
          {!verificationResult && (
            <div className="mt-6 md:mt-8 p-5 md:p-6 bg-[var(--v2-secondary-container)]/30 border-2 border-dashed border-[var(--v2-secondary-container)] rounded-2xl flex items-center gap-4">
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
          )}
        </div>

        {/* Secondary Info Section */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Scan QR Card */}
          <button
            onClick={startScanner}
            disabled={!hasCamera}
            className="w-full bg-[var(--v2-surface-container-low)] rounded-[2rem] p-6 md:p-8 overflow-hidden relative text-left disabled:opacity-50">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--v2-primary)]/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[var(--v2-primary)]/10 flex items-center justify-center mb-4">
                <span className="v2-icon text-2xl text-[var(--v2-primary)]">qr_code_scanner</span>
              </div>
              <h3 className="text-xl v2-headline font-bold text-[var(--v2-on-surface)] mb-2">
                Scan QR Code
              </h3>
              <p className="text-[var(--v2-on-surface-variant)] text-sm">
                {hasCamera
                  ? 'Tap to open camera and scan customer QR code instantly.'
                  : 'Camera not available on this device.'}
              </p>
            </div>
          </button>

          {/* Guidelines Card */}
          <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-6 md:p-8 shadow-[0_20px_40px_rgba(73,38,4,0.06)]">
            <h3 className="text-lg v2-headline font-bold text-[var(--v2-on-surface)] mb-4">
              Redemption Guide
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="v2-icon text-[var(--v2-secondary)] text-lg">check_circle</span>
                <span className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
                  Gift must be <strong>claimed</strong> by recipient before redemption.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="v2-icon text-[var(--v2-secondary)] text-lg">check_circle</span>
                <span className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
                  Verify the gift amount matches customer's purchase.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="v2-icon text-[var(--v2-secondary)] text-lg">check_circle</span>
                <span className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
                  Redemption is permanent and cannot be reversed.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Redemptions */}
      <section className="bg-[var(--v2-surface-container-low)] rounded-[2rem] p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 md:mb-8 gap-4">
          <div>
            <h3 className="text-xl md:text-2xl v2-headline font-bold text-[var(--v2-on-surface)]">
              Recent Redemptions
            </h3>
            <p className="text-[var(--v2-on-surface-variant)] text-sm">Your latest successful redemptions</p>
          </div>
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
            {recentRedemptions.slice(0, 6).map((redemption: any) => (
              <div
                key={redemption.id}
                className="bg-[var(--v2-surface-container-lowest)] p-5 md:p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--v2-secondary-container)]/50 text-[var(--v2-secondary)]">
                    <span className="v2-icon">check_circle</span>
                  </div>
                  <div>
                    <p className="font-bold text-[var(--v2-on-surface)]">{redemption.desc || 'Redemption'}</p>
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">{redemption.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg v2-headline font-extrabold text-[var(--v2-on-surface)]">
                    {formatCurrency(redemption.amount, currency)}
                  </p>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)]">
                    Success
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
