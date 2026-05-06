'use client';

import {useState, useMemo} from 'react';
import Link from 'next/link';
import { Gift } from 'lucide-react';
import { FlexCard3D } from './FlexCardVariants';

/**
 * FlexHeroCard - A dedicated high-fidelity replication of the flagship Flex Card
 */
export function FlexHeroCard({product, className}: {product: any, className?: string}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const randomId = useMemo(() => Math.random().toString(36).substring(2, 10).toUpperCase(), []);

  if (!product) return null;
  
  return (
    <div 
      className={`w-full h-full min-h-[300px] md:min-h-[440px] rounded-[2.5rem] p-4 md:p-8 flex items-center justify-center relative group hover:shadow-2xl transition-all duration-500 cursor-pointer ${className}`}
      style={{ background: `linear-gradient(135deg, ${product.colorFrom || '#f9873e'} 0%, ${product.colorTo || '#964300'} 100%)`, perspective: '2000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
        {/* Premium Background Effects */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent)] rounded-[2.5rem]" />
        <div className="absolute inset-0 v2-watermark text-3xl md:text-5xl opacity-[0.03] select-none uppercase tracking-[1em] overflow-hidden rounded-[2.5rem]">GIFTHANCE</div>
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem]" />

        {/* Brand Mark on the container */}
        <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 opacity-20 pointer-events-none select-none z-0">
             <div className="v2-card-branding flex flex-col items-end">
                <div className="bg-white/20 p-1.5 rounded-lg border border-white/20">
                    <Gift className="w-6 h-6 md:w-8 md:h-8 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[8px] md:text-[9px] tracking-[0.3em] uppercase font-black text-white mt-2">Gifthance Asset</span>
             </div>
        </div>

        {/* 3D Flip Container */}
        <div className="w-full max-w-[340px] md:max-w-[480px] aspect-[1.586/1] relative transition-transform duration-700 z-10 group-hover:scale-[1.03]">
            <FlexCard3D 
                variant="emerald"
                isFlipped={isFlipped}
                onFlipToggle={setIsFlipped}
                amount={product?.price || 3000}
                randomId={randomId}
            />
        </div>
    </div>
  );
}

/**
 * FlexHeroBanner - The standalone huge hero banner featuring the interactive Flex Card.
 */
export function FlexHeroBanner() {
  const [isHeroFlipped, setIsHeroFlipped] = useState(false);
  const heroRandomId = useMemo(() => Math.random().toString(36).substring(2, 10).toUpperCase(), []);

  return (
    <section className="mb-24">
        <Link href="/gifts/flex-card" className="block relative w-full rounded-[2.5rem] bg-[#1a3d2e] overflow-hidden group shadow-2xl">
            {/* Wavy background / texture (abstract lines simulation) */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.08),transparent_50%)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a3d2e] via-[#102d20] to-[#0a1f16]" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 items-center p-8 md:p-14 min-h-[300px] md:min-h-[440px]">
                
                {/* LEFT CONTENT */}
                <div className="col-span-1 lg:col-span-7 space-y-6 md:space-y-8 z-20">
                    <div className="inline-flex items-center gap-2 bg-[#1f4a38] border border-white/5 px-4 py-2 md:py-2.5 rounded-full">
                        <div className="w-4 h-4 rounded-full bg-[#ff6b3d] flex items-center justify-center -ml-1">
                            <span className="v2-icon text-white text-[10px] font-bold">check</span>
                        </div>
                        <span className="text-[#ff6b3d] text-[9px] md:text-xs font-black uppercase tracking-[0.15em]">
                            Universal Gift Card
                        </span>
                    </div>

                    <div>
                        <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-black text-white font-headline tracking-tighter mb-4 lg:mb-6 leading-none">
                            Gifthance Flex Card
                        </h1>
                        <p className="text-white/80 text-base md:text-lg max-w-lg leading-relaxed font-medium">
                            The ultimate universal credit for your corporate gifting needs. One card, infinite possibilities across our entire marketplace.
                        </p>
                    </div>

                    <div className="v2-btn-primary px-8 py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center md:justify-start gap-3 w-fit hover:shadow-[var(--v2-primary)]/40 hover:bg-[var(--v2-primary)]/90">
                        Get Flex Card <span className="v2-icon">arrow_forward</span>
                    </div>
                </div>
                
                {/* RIGHT CARD VISUAL - Interactive Flip Card */}
                 <div 
                     className="col-span-1 lg:col-span-5 h-[280px] sm:h-[300px] md:h-full w-full relative mt-8 md:mt-0 select-none overflow-visible z-30"
                     style={{ perspective: '2000px' }}
                 >
                     <div className="absolute top-[5%] md:top-[10%] right-[2%] sm:right-[5%] md:right-[-5%] lg:right-[-10%] xl:right-[-5%] w-[330px] sm:w-[360px] md:w-[480px] aspect-[1.586/1] transition-transform duration-700 md:translate-x-0 relative z-30 group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rotate-[5deg] group-hover:-translate-y-4 group-hover:rotate-[8deg]">
                         <div className="w-full h-full relative transition-transform duration-700">
                             <FlexCard3D 
                                 variant="emerald"
                                 isFlipped={isHeroFlipped}
                                 onFlipToggle={setIsHeroFlipped}
                                 randomId={heroRandomId}
                                 amount={3000}
                             />
                         </div>
                     </div>
                 </div>

            </div>
        </Link>
    </section>
  );
}
