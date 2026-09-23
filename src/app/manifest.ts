import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Benva Healthcare',
    short_name: 'Benva',
    description: 'Benva Healthcare App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#002b5c',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
