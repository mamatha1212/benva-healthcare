import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Benva Admin',
  manifest: '/admin-manifest.json',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
