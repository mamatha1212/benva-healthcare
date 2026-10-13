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
          if ('caches' in window) {
            caches.keys().then(function(names) {
              for (var i = 0; i < names.length; i++) {
                if (names[i].indexOf('next-static-js-assets') !== -1 || names[i].indexOf('pages') !== -1) {
                  caches.delete(names[i]);
                }
              }
            });
          }
        `}
      </Script>
      {children}
    </>
  );
}
