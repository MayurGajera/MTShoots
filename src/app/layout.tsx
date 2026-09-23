import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '@/index.css';
import { ClientShell } from '@/components/ClientShell';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontSerif = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MTShoots - Discover and Book Top Professional Photographers in India',
  description: 'MTShoots connects you with verified professional photographers across India.',
  keywords: [
    'photographer booking',
    'hire photographer India',
    'wedding photographer Mumbai',
    'fashion photoshoot Delhi',
    'commercial photography Bangalore',
    'MTShoots photography',
  ],
  authors: [{ name: 'MTShoots' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'MTShoots - India Photography Network',
    description:
      "Book India's finest verified photographers with upfront rates and instant booking.",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'MTShoots',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'MTShoots Photography Network',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MTShoots - India Photography Network',
    description: 'Find verified photographers, compare portfolios, and book effortlessly.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable + ' ' + fontSerif.variable} suppressHydrationWarning>
            <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#C85A32" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MTShoots" />
      </head>
      <body className="font-sans antialiased bg-[#FAF8F5] text-[#181615] max-w-full overflow-x-clip" suppressHydrationWarning>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
