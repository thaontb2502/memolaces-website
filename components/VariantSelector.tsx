'use client';

import type { ProductVariant } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (variant: ProductVariant) => void;
}) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-wide text-stone-700">Phân loại</h2>
        <span className="text-xs font-bold text-stone-500">{variants.length} lựa chọn</span>
      </div>
      <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {variants.map((variant) => (
          <button
            type="button"
            key={variant.id}
            onClick={() => onSelect(variant)}
            className={`rounded-lg border p-3 text-left transition ${selectedId === variant.id ? 'border-emerald-900 bg-emerald-50 ring-2 ring-emerald-900/10' : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'}`}
            disabled={variant.stock <= 0}
          >
            <span className="block font-black text-emerald-950">{variant.name}</span>
            <span className="mt-1 block text-sm text-rose-700">{variant.price > 0 ? formatCurrency(variant.price) : 'Liên hệ'}</span>
            <span className="mt-1 block text-xs text-stone-500">SKU {variant.sku} · {variant.stock > 0 ? `Còn ${variant.stock}` : 'Tạm hết hàng'}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
