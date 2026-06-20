'use client';

import Link from 'next/link';
import { CreditCard, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from './CartProvider';
import { QuantitySelector } from './QuantitySelector';
import { EmptyState } from './EmptyState';
import { formatCurrency } from '@/lib/format';

export function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart();

  if (!items.length) {
    return (
      <div className="container-page py-12">
        <EmptyState title="Giỏ hàng đang trống" description="Bạn chọn thêm sản phẩm rồi quay lại đây để kiểm tra đơn hàng." actionHref="/products" actionLabel="Tiếp tục mua hàng" />
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 py-10 lg:grid-cols-[1fr_380px]">
      <section className="grid gap-3">
        {items.map((item) => (
          <article key={item.variantId} className="grid gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto]">
            <img src={item.image} alt={item.productName || item.name || 'Sản phẩm'} title={item.productName || item.name || 'Sản phẩm'} className="aspect-square w-full rounded-lg object-cover sm:w-[110px]" />
            <div>
              <h2 className="font-black text-emerald-950">{item.productName || item.name}</h2>
              <p className="mt-1 text-sm text-stone-600">Phân loại: {item.variantName}</p>
              <p className="mt-1 text-sm text-stone-600">SKU: {item.sku}</p>
              <p className="mt-2 font-black text-rose-700">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
              <QuantitySelector value={item.quantity} max={item.stock} onChange={(value) => updateQuantity(item.variantId, value)} />
              <button type="button" onClick={() => removeItem(item.variantId)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-rose-200 px-3 text-sm font-black text-rose-700 hover:bg-rose-50">
                <Trash2 size={17} /> Xóa
              </button>
              <strong className="text-emerald-950">{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5 shadow-lg lg:sticky lg:top-28">
        <h2 className="flex items-center gap-2 text-xl font-black text-emerald-950"><ShoppingBag size={22} /> Tóm tắt giỏ hàng</h2>
        <div className="mt-4 flex justify-between border-t border-stone-100 pt-4 text-sm">
          <span>Tạm tính</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        <div className="mt-2 flex justify-between text-sm text-stone-600">
          <span>Vận chuyển</span>
          <span>Tính khi xác nhận</span>
        </div>
        <div className="mt-5 grid gap-3">
          <Link href="/checkout" className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-3 text-center text-sm font-black text-white shadow-lg hover:bg-rose-700"><CreditCard size={18} /> Thanh toán</Link>
          <Link href="/products" className="rounded-lg border border-stone-200 bg-white px-5 py-3 text-center text-sm font-black text-emerald-950 hover:bg-emerald-50">Tiếp tục mua hàng</Link>
        </div>
      </aside>
    </div>
  );
}
