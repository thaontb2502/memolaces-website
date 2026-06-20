import Link from 'next/link';
import { Eye, PackageCheck } from 'lucide-react';
import type { Product } from '@/lib/types';
import { PriceDisplay } from './PriceDisplay';
import { QuickAddButton } from './QuickAddButton';

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      <Link href={`/products/${encodeURIComponent(product.id)}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-stone-100">
          <img
            src={product.coverImage}
            alt={product.name}
            title={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-black shadow-sm ${inStock ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-white'}`}>
            {inStock ? 'Có hàng' : 'Tạm hết'}
          </span>
          {product.variants.length > 1 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-black text-emerald-900 shadow-sm">
              Nhiều phân loại
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs font-bold">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">{product.category}</span>
          <span className={inStock ? 'text-emerald-700' : 'text-rose-700'}>{inStock ? `Còn ${product.stock}` : 'Tạm hết hàng'}</span>
        </div>
        <Link href={`/products/${encodeURIComponent(product.id)}`} className="line-clamp-2 min-h-12 font-black leading-6 text-emerald-950 hover:text-rose-700">
          {product.name}
        </Link>
        <PriceDisplay minPrice={product.minPrice} maxPrice={product.maxPrice} />
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <PackageCheck size={15} />
          <span>{product.variants.length} phân loại · SKU {product.sku}</span>
        </div>
        {(product.lengths.length > 0 || product.styleTags.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {product.lengths.slice(0, 2).map((length) => (
              <span key={length} className="rounded-full bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-600">{length}</span>
            ))}
            {product.styleTags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">{tag}</span>
            ))}
          </div>
        )}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <QuickAddButton product={product} />
          <Link href={`/products/${encodeURIComponent(product.id)}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-900 px-3 text-sm font-black text-white hover:bg-emerald-800">
            <Eye size={17} />
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
