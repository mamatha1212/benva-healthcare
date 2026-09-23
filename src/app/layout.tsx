import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#002b5c',
};

export const metadata: Metadata = {
  title: 'Benva Healthcare — Change A Life Today',
  description:
    'Join Benva Healthcare in our mission to provide food, shelter, education, and hope to communities in need. Every act of kindness brings us closer to a better world.',
  keywords: 'healthcare, charity, donation, children, hope, community',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Benva',
  },
  formatDetection: {
    telephone: false,
  },
};

import FloatingContactButtons from '@/components/FloatingContactButtons/FloatingContactButtons';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <FloatingContactButtons />
      </body>
    </html>
  );
}
