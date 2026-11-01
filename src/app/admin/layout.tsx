import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Benva Admin',
  manifest: '/admin-manifest.json',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script id="clear-admin-cache" strategy="beforeInteractive">
        {`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
              for (var i = 0; i < regs.length; i++) {
                regs[i].unregister();
              }
            });
          }
          if ('caches' in window) {
            caches.keys().then(function(names) {
              for (var i = 0; i < names.length; i++) {
                caches.delete(names[i]);
              }
            });
          }
        `}
      </Script>
      {children}
    </>
  );
}
