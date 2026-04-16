import Providers from '@/components/providers';
import type {Metadata} from 'next';
import './globals.css';
import './v2.css';

export const metadata: Metadata = {
  title: 'Gifthance | Enhancing the joy of giving',
  description: 'Gift and support the people you care about',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Standard Google Fonts for Text */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --font-v2-headline: 'Plus Jakarta Sans', sans-serif;
            --font-v2-body: 'Manrope', sans-serif;
          }
        `,
          }}
        />
      </head>
      <body className={`v2-theme`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
