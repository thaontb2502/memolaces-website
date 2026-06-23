import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ProductsPageClient } from '@/components/ProductsPageClient';
import { getCatalog } from '@/lib/catalog';

export const metadata: Metadata = {
  title: { absolute: 'Dây Giày & Phụ Kiện Giày | MEMOLACES' },
  description: 'Mua dây giày, phụ kiện trang trí, vệ sinh và bảo quản giày tại MEMOLACES. Lọc theo danh mục, độ dài, kiểu dây, giá và tình trạng hàng.',
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'Dây Giày & Phụ Kiện Giày | MEMOLACES',
    description: 'Mua dây giày, phụ kiện trang trí, vệ sinh và bảo quản giày tại MEMOLACES.',
    url: '/products',
    type: 'website',
  },
};

export default function ProductsPage() {
  const { products, categories } = getCatalog();

  return (
    <>
      <Breadcrumb items={[{ label: 'Sản phẩm' }]} />
      <Suspense fallback={null}>
        <ProductsPageClient products={products} categories={categories} />
      </Suspense>
    </>
  );
}
