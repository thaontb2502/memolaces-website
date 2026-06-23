'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/types';
import { formatCurrency, formatPriceRange } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { useCart } from './CartProvider';
import { ProductGallery } from './ProductGallery';
import { QuantitySelector } from './QuantitySelector';
import { VariantSelector } from './VariantSelector';

export function ProductDetailClient({ product }: { product: Product }) {
  const firstAvailable = useMemo(() => product.variants.find((variant) => variant.stock > 0) ?? product.variants[0], [product.variants]);
  const [selectedVariant, setSelectedVariant] = useState(firstAvailable);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const stock = selectedVariant?.stock ?? 0;
  const canBuy = Boolean(selectedVariant && stock > 0 && selectedVariant.price > 0);
  const displayPrice = selectedVariant
    ? selectedVariant.price > 0
      ? formatCurrency(selectedVariant.price)
      : product.maxPrice > 0
        ? formatPriceRange(product.minPrice, product.maxPrice)
        : 'Liên hệ'
    : product.maxPrice > 0
      ? formatPriceRange(product.minPrice, product.maxPrice)
      : 'Liên hệ';

  const selectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedVariant || !canBuy) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      name: product.name,
      variantName: selectedVariant.name,
      sku: selectedVariant.sku,
      image: selectedVariant.image || product.coverImage,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      quantity,
    });
  };

  return (
    <section className="container-page grid gap-8 pb-14 lg:grid-cols-[minmax(0,1fr)_500px]">
      <ProductGallery images={product.images} selectedImage={selectedVariant?.image} productName={product.name} />

      <div className="h-fit rounded-lg border border-stone-200 bg-white p-5 shadow-lg md:p-7 lg:sticky lg:top-28">
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700">{product.category}</span>
        <h1 className="mt-2 text-3xl font-black leading-tight text-emerald-950 md:text-4xl">{product.name}</h1>
        <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-4xl font-black text-rose-700">
          {displayPrice}
        </div>

        <dl className="mt-5 grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">SKU</dt>
            <dd className="font-black text-stone-900">{selectedVariant?.sku || product.sku}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Tồn kho</dt>
            <dd className={stock > 0 ? 'font-black text-emerald-700' : 'font-black text-rose-700'}>{stock > 0 ? `Còn ${stock}` : 'Tạm hết hàng'}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <VariantSelector variants={product.variants} selectedId={selectedVariant?.id ?? ''} onSelect={selectVariant} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <QuantitySelector value={quantity} max={Math.max(1, stock)} onChange={setQuantity} />
          <button
            type="button"
            onClick={addToCart}
            disabled={!canBuy}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 text-base font-black text-white shadow-lg transition hover:bg-rose-700 disabled:bg-stone-300 disabled:text-stone-600 disabled:shadow-none"
          >
            <ShoppingCart size={19} />
            {stock <= 0 ? 'Tạm hết hàng' : selectedVariant?.price ? 'Thêm vào giỏ' : 'Liên hệ đặt hàng'}
          </button>
        </div>

        {!canBuy && (
          <Link href="/contact" className="mt-3 block rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-sm font-black text-rose-700">
            {stock <= 0 ? 'Sản phẩm đang tạm hết hàng, liên hệ để đặt trước' : 'Sản phẩm chưa có giá bán hợp lệ, liên hệ để được báo giá'}
          </Link>
        )}

        <a
          href={siteConfig.zalo}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex min-h-12 items-center justify-center rounded-lg border border-emerald-900 bg-white px-5 text-sm font-black text-emerald-950 hover:bg-emerald-50"
        >
          Tư vấn qua Zalo
        </a>

        <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <h2 className="text-sm font-black uppercase tracking-wide text-emerald-700">Hướng dẫn chọn độ dài dây</h2>
          <div className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
            {siteConfig.lengths.map((item) => (
              <Link key={item.label} href={item.href} className="rounded-md bg-white px-3 py-2 font-bold hover:text-emerald-800">
                {item.label}: <span className="font-normal">{item.text}</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs font-bold text-stone-500">Thông tin chỉ là gợi ý. Liên hệ Zalo để được tư vấn chính xác theo mẫu giày.</p>
        </div>

        <div className="mt-6 grid gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-stone-700">
          <div className="flex gap-2"><Truck size={19} className="text-emerald-700" /> Giao hàng toàn quốc, đóng gói cẩn thận</div>
          <div className="flex gap-2"><CheckCircle2 size={19} className="text-emerald-700" /> Hỗ trợ đổi trả và kiểm tra hàng</div>
          <div className="flex gap-2"><ShieldCheck size={19} className="text-emerald-700" /> Hình ảnh sản phẩm sát thực tế, hỗ trợ tư vấn trước khi mua</div>
        </div>
      </div>
    </section>
  );
}
