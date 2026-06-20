import { Suspense } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ProductsPageClient } from '@/components/ProductsPageClient';
import { getCatalog } from '@/lib/catalog';

export default function ProductsPage() {
  const { products, categories } = getCatalog();

  return (
    <>
      <Breadcrumb items={[{ label: 'Sản phẩm' }]} />
      <section className="container-page pb-6">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Catalog</span>
          <h1 className="mt-1 text-4xl font-black text-emerald-950">Tất cả sản phẩm</h1>
          <p className="mt-3 max-w-2xl text-stone-600">
          Tìm kiếm, lọc theo danh mục, khoảng giá, trạng thái hàng và sắp xếp theo nhu cầu.
          </p>
        </div>
      </section>
      <Suspense fallback={null}>
        <ProductsPageClient products={products} categories={categories} />
      </Suspense>
    </>
  );
}
