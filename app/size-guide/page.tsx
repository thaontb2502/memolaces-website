import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MessageCircle, Ruler } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Hướng dẫn chọn size dây giày',
  description:
    'Gợi ý chọn độ dài dây giày 100cm, 120cm, 140cm, 160cm và 180cm. Liên hệ MEMOLACES qua Zalo để được tư vấn theo mẫu giày.',
};

export default function SizeGuidePage() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Hướng dẫn chọn size' }]} />
      <section className="container-page pb-14">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <span className="text-sm font-black uppercase tracking-wide text-emerald-700">MEMOLACES Guide</span>
          <h1 className="mt-2 text-4xl font-black text-emerald-950">Hướng dẫn chọn độ dài dây giày</h1>
          <p className="mt-4 max-w-3xl leading-8 text-stone-600">
            Mỗi mẫu giày có số lỗ xỏ, form và cách buộc khác nhau. Bảng dưới đây là gợi ý nhanh để bạn chọn dây dễ hơn trước khi đặt hàng.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {siteConfig.lengths.map((item) => (
            <Link key={item.label} href={item.href} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <Ruler size={21} />
              </span>
              <h2 className="mt-4 text-2xl font-black text-emerald-950">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 p-5 md:p-6">
          <h2 className="text-xl font-black text-emerald-950">Cần tư vấn chính xác hơn?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-700">
            Liên hệ Zalo để MEMOLACES tư vấn theo mẫu giày, số lỗ xỏ và kiểu buộc bạn muốn dùng.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={siteConfig.zalo} className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-5 py-3 text-sm font-black text-white">
              <MessageCircle size={17} /> Liên hệ Zalo
            </a>
            <Link href="/products?category=Dây%20Giày" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black text-emerald-950">
              Xem dây giày <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
