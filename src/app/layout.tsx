import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Benva Healthcare — Change A Life Today',
  description:
    'Join Benva Healthcare in our mission to provide food, shelter, education, and hope to communities in need. Every act of kindness brings us closer to a better world.',
  keywords: 'healthcare, charity, donation, children, hope, community',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
