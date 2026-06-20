import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { getCatalog, getProductById, getRelatedProducts } from '@/lib/catalog';

export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: 'Không tìm thấy sản phẩm' };

  return {
    title: product.name,
    description: product.description.slice(0, 150),
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const relatedProducts = getRelatedProducts(product);

  return (
    <>
      <Breadcrumb items={[{ label: 'Sản phẩm', href: '/products' }, { label: product.name }]} />
      <ProductDetailClient product={product} />

      <section className="container-page pb-12">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-7">
          <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Chi tiết</span>
          <h2 className="mt-1 text-2xl font-black text-emerald-950">Mô tả sản phẩm</h2>
          <div className="mt-5 max-w-none whitespace-pre-line rounded-lg bg-stone-50 p-5 leading-8 text-stone-700">{product.description}</div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="container-page pb-14">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Cùng danh mục</span>
              <h2 className="mt-1 text-3xl font-black text-emerald-950">Sản phẩm liên quan</h2>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard product={item} key={item.id} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
