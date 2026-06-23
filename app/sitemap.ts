import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteConfig.canonicalDomain, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteConfig.canonicalDomain}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteConfig.canonicalDomain}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteConfig.canonicalDomain}/size-guide`, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const productPages: MetadataRoute.Sitemap = getCatalog().products.map((product) => ({
    url: `${siteConfig.canonicalDomain}/products/${product.id}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
