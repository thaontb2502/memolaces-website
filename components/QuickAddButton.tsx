'use client';

import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from './CartProvider';

export function QuickAddButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const variant = product.variants.find((item) => item.stock > 0 && item.price > 0);
  const disabled = !variant;

  const addQuick = () => {
    if (!variant) return;

    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      name: product.name,
      variantName: variant.name,
      sku: variant.sku,
      image: variant.image || product.coverImage,
      price: variant.price,
      stock: variant.stock,
      quantity: 1,
    });
  };

  return (
    <button
      type="button"
      onClick={addQuick}
      disabled={disabled}
      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-900 bg-white px-3 text-sm font-black text-emerald-950 transition hover:bg-emerald-50 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400"
    >
      <ShoppingCart size={17} />
      Thêm nhanh
    </button>
  );
}
