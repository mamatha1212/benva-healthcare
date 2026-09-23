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
      <Script id="register-admin-sw" strategy="afterInteractive">
        {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin/' }).then(function(registration) {
                console.log('Admin ServiceWorker registration successful with scope: ', registration.scope);
              }, function(err) {
                console.log('Admin ServiceWorker registration failed: ', err);
              });
            });
          }
        `}
      </Script>
      {children}
    </>
  );
}
