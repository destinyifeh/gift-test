import type {Metadata} from 'next';
import {Plus_Jakarta_Sans, Manrope} from 'next/font/google';
import './v2.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-v2-headline',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-v2-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Gifthance V2 | Enhancing the joy of giving',
  description: 'Gift and support the people you care about',
};

export default function V2Layout({children}: {children: React.ReactNode}) {
  return (
    <>
      {/* Material Symbols Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        rel="stylesheet"
      />
      <div className={`${plusJakartaSans.variable} ${manrope.variable} v2-theme`}>
        {children}
      </div>
    </>
  );
}
