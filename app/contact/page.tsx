import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { siteConfig } from '@/lib/site-config';

export default function ContactPage() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Liên hệ' }]} />
      <section className="container-page grid gap-6 pb-14 lg:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-7">
          <span className="text-sm font-black uppercase tracking-wide text-emerald-700">{siteConfig.shopName}</span>
          <h1 className="mt-2 text-3xl font-black text-emerald-950">Liên hệ cửa hàng</h1>
          <p className="mt-3 text-stone-600">Thông tin đang dùng từ file cấu hình, bạn có thể thay bằng số điện thoại, Zalo và địa chỉ thật.</p>
          <form className="mt-6 grid gap-4">
            <input className="h-12 rounded-lg border border-stone-200 px-3 outline-none focus:border-emerald-800" placeholder="Họ tên" />
            <input className="h-12 rounded-lg border border-stone-200 px-3 outline-none focus:border-emerald-800" placeholder="Số điện thoại hoặc email" />
            <textarea className="min-h-32 rounded-lg border border-stone-200 p-3 outline-none focus:border-emerald-800" placeholder="Nội dung cần tư vấn" />
            <button type="button" className="rounded-lg bg-emerald-900 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800">Gửi liên hệ</button>
          </form>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-emerald-950">Thông tin shop</h2>
            <div className="mt-4 grid gap-3 text-sm text-stone-700">
              <span className="flex gap-2"><Phone size={18} className="text-emerald-700" /> {siteConfig.phone}</span>
              <span className="flex gap-2"><Mail size={18} className="text-emerald-700" /> {siteConfig.email}</span>
              <span className="flex gap-2"><MapPin size={18} className="text-emerald-700" /> {siteConfig.address}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-3 text-sm font-black text-white">
                <Phone size={17} /> Gọi điện
              </a>
              <a href={siteConfig.zalo} className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 px-4 py-3 text-sm font-black text-emerald-950">
                <MessageCircle size={17} /> Zalo
              </a>
            </div>
          </div>
          <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-stone-300 bg-stone-100 p-6 text-center text-sm font-bold text-stone-500">
            Bản đồ placeholder
          </div>
        </aside>
      </section>
    </>
  );
}
