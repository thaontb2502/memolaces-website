import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ContactForm } from '@/components/ContactForm';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: { absolute: 'Liên Hệ MEMOLACES' },
  description: 'Liên hệ MEMOLACES để được tư vấn chọn dây giày, độ dài, phụ kiện và sản phẩm chăm sóc giày.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Liên Hệ MEMOLACES',
    description: 'Liên hệ MEMOLACES để được tư vấn chọn dây giày, độ dài và phụ kiện phù hợp.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  const hasEmail = Boolean(siteConfig.email && siteConfig.email !== 'email@example.com');
  const hasFacebook = Boolean(siteConfig.facebook && siteConfig.facebook !== '#');
  const hasTikTok = Boolean(siteConfig.tiktok && siteConfig.tiktok !== '#');

  return (
    <>
      <Breadcrumb items={[{ label: 'Liên hệ' }]} />
      <section className="container-page grid gap-6 pb-14 lg:grid-cols-[minmax(0,1fr)_420px]">
        <ContactForm />

        <aside className="grid h-fit gap-4">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-6">
            <span className="text-sm font-black uppercase tracking-wide text-emerald-700">{siteConfig.shopName}</span>
            <h1 className="mt-2 text-3xl font-black text-emerald-950">Liên hệ cửa hàng</h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">Shop hỗ trợ tư vấn chọn độ dài dây, màu sắc và phân loại phù hợp với mẫu giày của bạn.</p>
            <div className="mt-5 grid gap-3 text-sm text-stone-700">
              <a href={siteConfig.phoneHref} className="flex items-center gap-2 font-bold hover:text-emerald-800"><Phone size={18} className="text-emerald-700" /> {siteConfig.phone}</a>
              {hasEmail && <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 font-bold hover:text-emerald-800"><Mail size={18} className="text-emerald-700" /> {siteConfig.email}</a>}
              <span className="flex items-center gap-2"><MapPin size={18} className="text-emerald-700" /> {siteConfig.address}</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a href={siteConfig.phoneHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-3 text-sm font-black text-white">
                <Phone size={17} /> Gọi điện
              </a>
              <a href={siteConfig.zalo} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-950">
                <MessageCircle size={17} /> Zalo
              </a>
              {hasFacebook && <a href={siteConfig.facebook} target="_blank" rel="noreferrer" className="rounded-lg border border-stone-200 px-4 py-3 text-center text-sm font-black">Facebook</a>}
              {hasTikTok && <a href={siteConfig.tiktok} target="_blank" rel="noreferrer" className="rounded-lg border border-stone-200 px-4 py-3 text-center text-sm font-black">TikTok</a>}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
            <p className="font-black">Tư vấn chọn dây chính xác hơn</p>
            <p className="mt-2">Khi nhắn shop, bạn nên gửi kèm tên mẫu giày, số lỗ xỏ và ảnh đôi giày để được tư vấn nhanh.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
