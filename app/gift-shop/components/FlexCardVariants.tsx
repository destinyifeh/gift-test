'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Gift } from 'lucide-react';

export type FlexCardVariant = 'green' | 'orange' | 'dark' | 'glass' | 'emerald' | 'dynamic';

interface FlexCard3DProps {
  variant: FlexCardVariant;
  isFlipped: boolean;
  onFlipToggle?: (flipped: boolean) => void;
  amount?: number;
  randomId?: string;
  dynamicStyle?: {
    colorFrom: string;
    colorTo: string;
  };
  mode?: 'preview' | 'active';
}

export function FlexCard3D({ 
    variant, 
    isFlipped, 
    onFlipToggle, 
    amount, 
    randomId,
    dynamicStyle,
    mode = 'preview'
}: FlexCard3DProps) {

  // Auto-generate ID if none provided
  const rawIdValue = useMemo(() => randomId || Math.random().toString(36).substring(2, 10).toUpperCase(), [randomId]);
  
  // Hardcoded Flex Card prefix
  const idValue = mode === 'preview' 
    ? `FLEX-••••••••` 
    : (rawIdValue.startsWith('FLEX-') ? rawIdValue : `FLEX-${rawIdValue}`);
  
  const getContainerStyle = () => {
      switch(variant) {
          case 'orange':
              return { background: 'linear-gradient(135deg, #d66514, #e8771a, #b14902)' };
          case 'dark':
              return { background: 'linear-gradient(135deg, #2b2b2b, #111111)' };
          case 'green':
              return { background: 'linear-gradient(135deg, #1a3d2e, #0a1f16)' };
          case 'emerald':
              return { background: 'linear-gradient(135deg, #1a3d2e, #0a1f16)' };
          case 'glass':
              return { background: 'linear-gradient(135deg, #d31b1b, #8b0000)' };
          case 'dynamic':
              return dynamicStyle ? { background: `linear-gradient(135deg, ${dynamicStyle.colorFrom}, ${dynamicStyle.colorTo})` } : { background: '#111' };
          default:
              return {};
      }
  };

  const getContainerClasses = () => {
      const base = "absolute inset-0 w-full h-full rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 flex flex-col justify-between overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] [backface-visibility:hidden] border border-white/20";
      if (variant === 'glass') return base;
      if (variant === 'emerald') return cn(base, "bg-gradient-to-br from-[#1a3d2e]/90 via-[#102d20]/85 to-[#0a1f16]/90 backdrop-blur-2xl");
      return base;
  };

  const handleToggle = (e: React.MouseEvent, forceState: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      onFlipToggle?.(forceState);
  };

  return (
    <div 
        className="w-full h-full relative transition-transform duration-700 select-none group"
        style={{ 
            transformStyle: 'preserve-3d', 
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
    >
        {/* FRONT FACE */}
        <div 
            className={cn(getContainerClasses(), isFlipped ? "pointer-events-none" : "pointer-events-auto")}
            style={getContainerStyle()}
        >
            <div className="absolute top-0 left-0 w-full h-[50%] bg-white/[0.05] filter blur-2xl rounded-[50%] pointer-events-none" />

            <div className="flex justify-between items-start relative z-10 w-full">
                <div className="flex items-center gap-3">
                    <Gift className="w-6.5 h-6.5 md:w-8.5 md:h-8.5 text-white/90" strokeWidth={2.5} />
                    <div className="flex flex-col">
                        <div className="font-headline font-black text-white tracking-tight text-3xl leading-none">Gifthance</div>
                        <div className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] mt-2">Flex Card</div>
                    </div>
                </div>
                <div className="px-4 py-2 bg-white/20 border border-white/10 rounded-full flex items-center justify-center -mr-2 md:mr-0 mt-2">
                    <span className="text-white text-[11px] md:text-sm font-black uppercase tracking-widest leading-none">Active</span>
                </div>
            </div>

            <div className="relative z-10 flex-grow flex flex-col justify-center mt-6 md:mt-10 pl-1 md:pl-2">
                <p className="text-white/70 text-[10px] md:text-xs font-black uppercase tracking-[0.1em] mb-1.5 md:mb-2">Available Balance</p>
                <p className="text-white font-black text-[2.5rem] md:text-[3.5rem] tracking-tight leading-none">
                    {amount && amount > 0 ? `₦${amount.toLocaleString()}` : "₦---"}
                </p>
            </div>

            <div className="flex justify-end items-end relative z-10 border-t border-white/10 pt-3 md:pt-8 mt-auto pb-0">
                <div 
                    className="flex shrink-0 items-center gap-2 text-white/50 leading-none mr-2 md:mr-0 hover:text-white transition-colors group/flipBtn z-50 pointer-events-auto cursor-pointer"
                    onClick={(e) => handleToggle(e, true)}
                >
                    <span className="text-[11px] md:text-sm font-black tracking-wide">Tap to flip</span>
                    <span className="v2-icon text-xs md:text-sm group-hover/flipBtn:rotate-180 transition-transform duration-700">sync</span>
                </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 rounded-[1.5rem] md:rounded-[2rem] pointer-events-none" />
        </div>

        {/* BACK FACE */}
        <div 
            className={cn(getContainerClasses(), isFlipped ? "pointer-events-auto" : "pointer-events-none")}
            style={{ ...getContainerStyle(), transform: 'rotateY(180deg)' }}
        >
            <div className="flex justify-center items-start relative z-10 w-full">
                <p className="text-white text-[11px] md:text-sm font-black tracking-[0.3em] opacity-90 drop-shadow-sm uppercase">Scan to Redeem</p>
            </div>
            
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center mt-4 md:mt-6 mb-2 min-h-0">
                <div className="w-[75px] h-[75px] sm:w-[95px] sm:h-[95px] md:w-[120px] md:h-[120px] bg-white rounded-xl md:rounded-[1.25rem] p-2 md:p-3 flex items-center justify-center shadow-xl flex-shrink-0 relative overflow-hidden">
                    <svg viewBox="0 0 24 24" fill="black" className={cn("w-full h-full opacity-90", mode === 'preview' && "blur-md opacity-30")} shapeRendering="crispEdges">
                        <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm-3-6h2v8h-2v-8z" />
                        <rect x="15" y="15" width="2" height="2" />
                        <rect x="19" y="19" width="2" height="2" />
                        <rect x="15" y="19" width="2" height="2" />
                        <rect x="19" y="15" width="2" height="2" />
                    </svg>
                    
                    {mode === 'preview' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-[inherit]">
                            <span className="v2-icon text-black/40 text-2xl md:text-3xl mb-1">lock</span>
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-black/60">Preview Only</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-end relative z-10 border-t border-white/10 pt-4 md:pt-8 mt-auto">
                 <p className="text-white/80 text-[11px] md:text-sm font-black tracking-[0.2em] font-mono leading-none truncate mr-4">{idValue}</p>
                 <div 
                    className="flex shrink-0 items-center gap-2 text-white/50 leading-none hover:text-white transition-colors group/flipBtnBack z-50 pointer-events-auto cursor-pointer"
                    onClick={(e) => handleToggle(e, false)}
                 >
                     <span className="text-[11px] md:text-sm font-black tracking-wide">Tap to flip back</span>
                     <span className="v2-icon text-xs md:text-sm group-hover/flipBtnBack:-rotate-180 transition-transform duration-700">sync</span>
                 </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 rounded-[1.5rem] md:rounded-[2rem] pointer-events-none" />
        </div>
    </div>
  );
}
