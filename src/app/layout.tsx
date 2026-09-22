import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import '@/index.css';
import { ClientShell } from '@/components/ClientShell';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MTShoots — Discover & Book Top Professional Photographers in India',
  description:
    'MTShoots connects you with verified, award-winning photographers across India. Transparent pricing, real-time availability, instant quotes, and verified portfolios for weddings, fashion, corporate shoots, and more.',
  keywords: [
    'photographer booking',
    'hire photographer India',
    'wedding photographer Mumbai',
    'fashion photoshoot Delhi',
    'commercial photography Bangalore',
    'MTShoots photography',
  ],
  authors: [{ name: 'MTShoots' }],
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: "MTShoots — India's Premier Photography Network",
    description:
      "Book India's finest verified photographers with upfront rates and instant booking.",
    url: 'http://localhost:3000',
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
    title: 'MTShoots — Book Verified Photographers Across India',
    description: 'Find verified photographers, compare portfolios, and book effortlessly.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable + ' ' + playfair.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-sans antialiased bg-[#FAF8F5] text-[#181615]">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
