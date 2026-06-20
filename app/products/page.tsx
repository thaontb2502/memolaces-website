import { Suspense } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ProductsPageClient } from '@/components/ProductsPageClient';
import { getCatalog } from '@/lib/catalog';

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
