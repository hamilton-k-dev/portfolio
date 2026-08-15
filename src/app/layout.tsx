import type { Metadata } from 'next';
import './globals.css';

/**
 * The absolute origin every share link is built from.
 *
 * Open Graph consumers — Slack, WhatsApp, X, LinkedIn — fetch the image over
 * the network from a third-party server, so a relative path resolves to
 * nothing. `metadataBase` is what turns `/og.jpg` into a URL a crawler can
 * actually reach.
 *
 * VERCEL_PROJECT_PRODUCTION_URL is the stable production alias, set
 * automatically at build time. VERCEL_URL is deliberately not used: it changes
 * on every deployment, so previews would advertise a preview URL as canonical.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

const title = 'Hamilton Kenfack — Full-Stack Developer & AI Systems Engineer';
const description =
  'Full-stack developer and creative technologist. I build AI-native products end to end — and I measure them.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: 'Hamilton Kenfack',
  authors: [{ name: 'Hamilton Kenfack' }],
  creator: 'Hamilton Kenfack',
  keywords: [
    'full-stack developer',
    'Next.js',
    'React',
    'TypeScript',
    'AI engineer',
    'freelance developer',
    'Cameroon',
  ],
  alternates: { canonical: '/' },

  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Hamilton Kenfack',
    title,
    description,
    locale: 'en_US',
    // The site ships a French translation applied at runtime; declaring it here
    // lets a crawler know the alternative exists.
    alternateLocale: ['fr_FR'],
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        // Read aloud by screen readers and shown when the image fails to load,
        // which on a slow connection is more often than you would think.
        alt: 'Hamilton Kenfack — full-stack developer and AI systems engineer',
        type: 'image/jpeg',
      },
    ],
  },

  twitter: {
    // summary_large_image is what produces the wide card. Plain "summary"
    // crops the same file into a small square and wastes it.
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* React 19 hoists these into <head> */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {children}
      </body>
    </html>
  );
}
