import type { Metadata } from 'next';
import './globals.css';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { CartProvider } from '@/components/CartProvider';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.canonicalDomain),
  title: {
    default: `${siteConfig.shopName} - ${siteConfig.slogan}`,
    template: `%s | ${siteConfig.shopName}`,
  },
  description: siteConfig.shortDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${siteConfig.shopName} - ${siteConfig.slogan}`,
    description: siteConfig.shortDescription,
    url: '/',
    siteName: siteConfig.shopName,
    locale: 'vi_VN',
    type: 'website',
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: `${siteConfig.shopName} - ${siteConfig.slogan}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.shopName} - ${siteConfig.slogan}`,
    description: siteConfig.shortDescription,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
