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
  manifest: '/manifest.json',
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
import InstallPrompt from '@/components/InstallPrompt/InstallPrompt';
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1466875548593805');
fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1466875548593805&ev=PageView&noscript=1"/>
        </noscript>
        {children}
        <FloatingContactButtons />
        <InstallPrompt />
      </body>
    </html>
  );
}
