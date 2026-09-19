import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/wp-admin/admin-ajax.php',
      disallow: ['/admin/', '/wp-admin/'],
    },
    sitemap: 'https://www.benvahealthcare.in/sitemap.xml',
  };
}
