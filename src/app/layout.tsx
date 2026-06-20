import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hamilton Kenfack — Full-Stack Developer & AI Systems Engineer',
  description:
    'Full-stack developer, AI systems engineer and creative technologist. Cinematic WebGL portfolio.',
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
