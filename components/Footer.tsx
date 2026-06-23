import Link from 'next/link';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export function Footer() {
  const hasEmail = Boolean(siteConfig.email && siteConfig.email !== 'email@example.com');
  const hasFacebook = Boolean(siteConfig.facebook && siteConfig.facebook !== '#');
  const hasTikTok = Boolean(siteConfig.tiktok && siteConfig.tiktok !== '#');

  return (
    <footer className="border-t border-stone-200 bg-emerald-950 text-white">
      <div className="container-page grid gap-8 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3 text-lg font-black">
            <span className="inline-flex rounded-lg bg-white p-2 shadow-sm">
              <img
                src="/images/brand/memolaces-logo.png"
                alt={siteConfig.shopName}
                title={siteConfig.shopName}
                className="h-10 w-36 object-contain"
              />
            </span>
          </div>
          <p className="mb-3 text-sm font-black text-emerald-100">{siteConfig.slogan}</p>
          <p className="max-w-sm text-sm leading-6 text-emerald-50/80">
            {siteConfig.shortDescription}
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide">Mua hàng</h3>
          <div className="grid gap-2 text-sm text-emerald-50/80">
            <Link href="/products">Tất cả sản phẩm</Link>
            <Link href="/products?category=Dây%20Giày">Dây giày</Link>
            <Link href="/size-guide">Hướng dẫn chọn size</Link>
            <Link href="/cart">Giỏ hàng</Link>
            <Link href="/checkout">Thanh toán</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide">Hỗ trợ</h3>
          <div className="grid gap-2 text-sm text-emerald-50/80">
            <span>Đổi trả trong 7 ngày</span>
            <span>Kiểm hàng trước khi nhận</span>
            <span>Tư vấn nhanh qua Zalo</span>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide">Liên hệ</h3>
          <div className="grid gap-3 text-sm text-emerald-50/80">
            <a href={siteConfig.phoneHref} className="flex gap-2 hover:text-white"><Phone size={17} /> {siteConfig.phone}</a>
            {hasEmail && <a href={`mailto:${siteConfig.email}`} className="flex gap-2 hover:text-white"><Mail size={17} /> {siteConfig.email}</a>}
            <span className="flex gap-2"><MapPin size={17} /> {siteConfig.address}</span>
            <a href={siteConfig.zalo} target="_blank" rel="noreferrer" className="flex gap-2 hover:text-white"><MessageCircle size={17} /> Zalo MEMOLACES</a>
            {hasFacebook && <a href={siteConfig.facebook} target="_blank" rel="noreferrer" className="hover:text-white">Facebook</a>}
            {hasTikTok && <a href={siteConfig.tiktok} target="_blank" rel="noreferrer" className="hover:text-white">TikTok</a>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-emerald-50/70">
        © 2026 {siteConfig.shopName}. All rights reserved.
      </div>
    </footer>
  );
}
