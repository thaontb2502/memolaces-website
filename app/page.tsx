import Link from 'next/link';
import { ArrowRight, Brush, CreditCard, Headphones, PackageCheck, Palette, RefreshCw, Ruler, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { getCatalog } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { siteConfig } from '@/lib/site-config';

const commitments = [
  { icon: Truck, title: 'Giao hàng nhanh', text: 'Đóng gói kỹ, hỗ trợ theo dõi đơn toàn quốc.' },
  { icon: RefreshCw, title: 'Đổi trả dễ dàng', text: 'Hỗ trợ đổi trả khi sản phẩm có lỗi từ shop.' },
  { icon: Headphones, title: 'Hỗ trợ khách hàng', text: `Tư vấn qua hotline ${siteConfig.phone} và Zalo.` },
  { icon: CreditCard, title: 'Thanh toán an toàn', text: 'Tóm tắt đơn rõ ràng, sẵn sàng tích hợp thanh toán online.' },
];

const featuredCollections = [
  { title: 'Dây giày', text: 'Dây thay thế theo màu, kiểu và độ dài.', href: '/products?category=Dây%20Giày' },
  { title: 'Dây theo độ dài', text: 'Tìm nhanh 100cm, 120cm, 140cm, 160cm, 180cm.', href: '/products?length=160cm' },
  { title: 'Phụ kiện trang trí', text: 'Charm, tag, tip và chi tiết custom.', href: '/products?category=Phụ%20Kiện%20Trang%20Trí' },
  { title: 'Vệ sinh & bảo quản', text: 'Chăm sóc, làm sạch và giữ form giày.', href: '/products?category=Vệ%20Sinh%20Giày' },
];

export default function HomePage() {
  const { products, report } = getCatalog();
  const featuredProducts = products.filter((product) => product.stock > 0).slice(0, 8);
  const newestProducts = products.slice(-8).reverse();
  const heroProduct = products.find((product) => !product.isMissingImage) ?? products[0];
  const reasonIcons = [Palette, PackageCheck, Brush, ShieldCheck, Truck, Ruler, Sparkles];

  return (
    <>
      <section className="border-b border-stone-200 bg-[#f4efe7]">
        <div className="container-page grid min-h-[560px] items-center gap-8 py-10 lg:grid-cols-[1.05fr_520px]">
          <div className="py-6">
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-800 shadow-sm">
              {siteConfig.shopName} · {siteConfig.slogan}
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-emerald-950 md:text-6xl">
              {siteConfig.shopName} - {siteConfig.slogan}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
              Thay dây mới, làm mới cả đôi giày.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">{siteConfig.shortDescription}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-800">
                Mua ngay <ArrowRight size={18} />
              </Link>
              <Link href="/size-guide" className="rounded-lg border border-stone-200 bg-white px-6 py-3 text-sm font-black text-emerald-950 hover:bg-emerald-50">Xem hướng dẫn chọn size</Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-2xl font-black text-emerald-950">{report.productRows}</p>
                <p className="text-xs font-bold text-stone-500">sản phẩm</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-2xl font-black text-emerald-950">{report.variantRows}</p>
                <p className="text-xs font-bold text-stone-500">phân loại</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-2xl font-black text-emerald-950">{report.imageRows}</p>
                <p className="text-xs font-bold text-stone-500">ảnh local</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-white bg-white p-3 shadow-2xl">
            <img src={heroProduct?.coverImage ?? '/images/placeholder-product.svg'} alt={heroProduct?.name ?? 'Sản phẩm nổi bật'} title={heroProduct?.name ?? 'Sản phẩm nổi bật'} className="h-[430px] w-full rounded-md object-cover" />
            <div className="absolute bottom-6 left-6 right-6 rounded-lg bg-white/95 p-4 shadow-lg backdrop-blur">
              <p className="line-clamp-2 font-black text-emerald-950">{heroProduct?.name ?? 'Sản phẩm nổi bật'}</p>
              <p className="mt-1 text-sm font-bold text-rose-700">{heroProduct ? `${heroProduct.variants.length} phân loại · Còn ${heroProduct.stock}` : 'Đang cập nhật'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:grid-cols-4">
          <div>
            <p className="text-3xl font-black text-emerald-950">{report.productRows}</p>
            <p className="text-sm text-stone-600">sản phẩm đọc được</p>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-950">{report.variantRows}</p>
            <p className="text-sm text-stone-600">phân loại đọc được</p>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-950">{report.imageRows}</p>
            <p className="text-sm text-stone-600">ảnh đọc được</p>
          </div>
          <div>
            <p className="text-3xl font-black text-rose-700">{report.missingImageProductIds.length}</p>
            <p className="text-sm text-stone-600">sản phẩm thiếu ảnh</p>
          </div>
        </div>
        {report.missingFiles.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
            Chưa tìm thấy file: {report.missingFiles.join(', ')}. Hãy đặt đúng tên file ở gốc project để website hiển thị dữ liệu thật.
          </div>
        )}
        {report.missingImageProductIds.length > 0 && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            Sản phẩm thiếu ảnh: {report.missingImageProductIds.slice(0, 20).join(', ')}
            {report.missingImageProductIds.length > 20 ? '...' : ''}
          </div>
        )}
      </section>

      <section id="categories" className="container-page scroll-mt-28 pb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Danh mục MEMOLACES</span>
            <h2 className="mt-1 text-3xl font-black text-emerald-950">Danh mục nổi bật</h2>
          </div>
          <Link href="/products" className="text-sm font-black text-emerald-800">Xem tất cả</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.categories.map((category) => (
            <Link key={category.name} href={category.href} className="group rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50">
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-white"><PackageCheck /></span>
              <h3 className="font-black text-emerald-950">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{category.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {category.children.slice(0, 3).map((child) => (
                  <span key={child} className="rounded-full bg-white px-2 py-1 text-xs font-bold text-stone-600 ring-1 ring-stone-200">{child}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-12">
        <div className="mb-5">
          <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Bộ sưu tập</span>
          <h2 className="mt-1 text-3xl font-black text-emerald-950">Mua theo nhu cầu</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {featuredCollections.map((item) => (
            <Link key={item.title} href={item.href} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50">
              <h3 className="text-lg font-black text-emerald-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-emerald-800">Xem sản phẩm <ArrowRight size={16} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-12">
        <div className="rounded-lg border border-stone-200 bg-emerald-950 p-6 text-white shadow-lg md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-black uppercase tracking-wide text-emerald-100">{siteConfig.secondarySlogans[2]}</span>
              <h2 className="mt-1 text-3xl font-black">Tại sao chọn {siteConfig.shopName}</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-black text-emerald-950">
              Khám phá sản phẩm <ArrowRight size={17} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {siteConfig.reasonsToChoose.map((reason, index) => {
              const Icon = reasonIcons[index % reasonIcons.length];
              return (
                <div key={reason} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-emerald-950"><Icon size={20} /></span>
                  <p className="mt-3 text-sm font-bold leading-6 text-white/90">{reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page pb-12">
        <div className="mb-5">
          <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Shop by Style</span>
          <h2 className="mt-1 text-3xl font-black text-emerald-950">Chọn theo mẫu giày và kiểu dây</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...siteConfig.laceTypes.slice(0, 6), ...siteConfig.styles.slice(0, 6)].slice(0, 8).map((item) => (
            <Link key={item.label} href={item.href} className="rounded-lg border border-stone-200 bg-white px-4 py-4 text-sm font-black text-emerald-950 shadow-sm hover:border-emerald-200 hover:bg-emerald-50">
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-12">
        <div className="mb-5">
          <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Shop by Length</span>
          <h2 className="mt-1 text-3xl font-black text-emerald-950">Chọn nhanh theo độ dài</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {siteConfig.lengths.map((item) => (
            <Link key={item.label} href={item.href} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm hover:border-emerald-200 hover:bg-emerald-50">
              <p className="text-2xl font-black text-emerald-950">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-12">
        <div className="mb-5">
          <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Đang bán</span>
          <h2 className="mt-1 text-3xl font-black text-emerald-950">Sản phẩm nổi bật</h2>
        </div>
        {featuredProducts.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="Chưa có sản phẩm nổi bật" description="Các sản phẩm còn hàng sẽ xuất hiện ở đây khi có dữ liệu CSV." />}
      </section>

      <section className="container-page pb-12">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Hướng dẫn chọn size</span>
              <h2 className="mt-1 text-3xl font-black text-emerald-950">Chưa chắc nên chọn dây dài bao nhiêu?</h2>
              <p className="mt-3 max-w-2xl leading-7 text-stone-600">Dùng bảng gợi ý theo số lỗ xỏ và dáng giày, hoặc nhắn Zalo để MEMOLACES tư vấn theo mẫu giày cụ thể.</p>
            </div>
            <Link href="/size-guide" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-5 py-3 text-sm font-black text-white">
              Xem size guide <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page pb-12">
        <div className="mb-5">
          <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Mới cập nhật</span>
          <h2 className="mt-1 text-3xl font-black text-emerald-950">Sản phẩm mới</h2>
        </div>
        {newestProducts.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{newestProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="Chưa có sản phẩm mới" description="Danh sách này sẽ được tạo từ thứ tự sản phẩm trong CSV." />}
      </section>

      <section className="bg-white py-12">
        <div className="container-page grid gap-4 md:grid-cols-4">
          {commitments.map((item) => (
            <div key={item.title} className="rounded-lg border border-stone-200 p-5 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><item.icon /></span>
              <h3 className="mt-4 font-black text-emerald-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
