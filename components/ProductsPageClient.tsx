'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Product, SortOption } from '@/lib/types';
import { FilterSidebar } from './FilterSidebar';
import { ProductGrid } from './ProductGrid';
import { SearchBar } from './SearchBar';

const PAGE_SIZE = 12;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function ProductsPageClient({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialCategory = searchParams.get('category') ?? 'all';
  const initialStock = searchParams.get('stock') ?? 'all';
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [stock, setStock] = useState(initialStock);
  const [price, setPrice] = useState('all');
  const [sort, setSort] = useState<SortOption>('price-asc');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const updateUrl = (updates: { category?: string; q?: string; stock?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if ('category' in updates) {
      if (!updates.category || updates.category === 'all') params.delete('category');
      else params.set('category', updates.category);
    }

    if ('q' in updates) {
      if (!updates.q?.trim()) params.delete('q');
      else params.set('q', updates.q.trim());
    }

    if ('stock' in updates) {
      if (!updates.stock || updates.stock === 'all') params.delete('stock');
      else params.set('stock', updates.stock);
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  useEffect(() => {
    setQuery(initialQuery);
    setCategory(initialCategory);
    setStock(initialStock);
    setVisible(PAGE_SIZE);
  }, [initialCategory, initialQuery, initialStock]);

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query);
    const [min, max] = price === 'all' ? [0, Infinity] : price.split('-').map(Number);

    return products
      .filter((product) => {
        const matchesQuery =
          !normalizedQuery ||
          normalize(product.name).includes(normalizedQuery) ||
          normalize(product.sku).includes(normalizedQuery) ||
          product.variants.some((variant) => normalize(`${variant.name} ${variant.sku}`).includes(normalizedQuery));
        const matchesCategory = category === 'all' || product.category === category;
        const matchesStock = stock === 'all' || (stock === 'in-stock' ? product.stock > 0 : product.stock === 0);
        const matchesPrice = price === 'all' || (product.maxPrice >= min && product.minPrice <= max);
        return matchesQuery && matchesCategory && matchesStock && matchesPrice;
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.minPrice - b.minPrice;
        if (sort === 'price-desc') return b.maxPrice - a.maxPrice;
        if (sort === 'name-desc') return b.name.localeCompare(a.name, 'vi');
        return a.name.localeCompare(b.name, 'vi');
      });
  }, [category, price, products, query, sort, stock]);

  const shown = filtered.slice(0, visible);
  const pageTitle = category === 'all' ? 'Tất cả sản phẩm' : category;

  return (
    <>
      <section className="container-page pb-6">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Catalog</span>
          <h1 className="mt-1 text-4xl font-black text-emerald-950">{pageTitle}</h1>
          <p className="mt-3 max-w-2xl text-stone-600">
            Tìm kiếm, lọc theo danh mục, khoảng giá, trạng thái hàng và sắp xếp theo nhu cầu.
          </p>
        </div>
      </section>
      <div className="container-page grid gap-6 pb-14 lg:grid-cols-[290px_1fr]">
      <FilterSidebar
        categories={categories}
        category={category}
        stock={stock}
        price={price}
        sort={sort}
        onCategoryChange={(value) => {
          setCategory(value);
          setVisible(PAGE_SIZE);
          updateUrl({ category: value });
        }}
        onStockChange={(value) => {
          setStock(value);
          setVisible(PAGE_SIZE);
          updateUrl({ stock: value });
        }}
        onPriceChange={(value) => {
          setPrice(value);
          setVisible(PAGE_SIZE);
        }}
        onSortChange={(value) => {
          setSort(value);
          setVisible(PAGE_SIZE);
        }}
      />
      <div className="grid gap-5">
        <SearchBar
          value={query}
          onChange={(value) => {
            setQuery(value);
            setVisible(PAGE_SIZE);
            updateUrl({ q: value });
          }}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
          <span className="font-bold text-emerald-950">Hiển thị {shown.length} / {filtered.length} sản phẩm</span>
          <span>{products.length} sản phẩm trong dữ liệu CSV</span>
        </div>
        <ProductGrid products={shown} />
        {visible < filtered.length && (
          <button type="button" onClick={() => setVisible((value) => value + PAGE_SIZE)} className="mx-auto rounded-lg border border-stone-200 bg-white px-6 py-3 text-sm font-black text-emerald-950 shadow-sm hover:bg-emerald-50">
            Xem thêm
          </button>
        )}
      </div>
    </div>
    </>
  );
}
