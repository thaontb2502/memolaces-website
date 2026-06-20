'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Product, SortOption } from '@/lib/types';
import { FilterSidebar } from './FilterSidebar';
import { ProductGrid } from './ProductGrid';
import { SearchBar } from './SearchBar';
import { siteConfig } from '@/lib/site-config';

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
  const initialStyle = searchParams.get('style') ?? 'all';
  const initialLength = searchParams.get('length') ?? 'all';
  const initialStock = searchParams.get('stock') ?? 'all';
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [style, setStyle] = useState(initialStyle);
  const [length, setLength] = useState(initialLength);
  const [stock, setStock] = useState(initialStock);
  const [price, setPrice] = useState('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const updateUrl = (updates: { category?: string; q?: string; stock?: string; style?: string; length?: string }) => {
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

    if ('style' in updates) {
      if (!updates.style || updates.style === 'all') params.delete('style');
      else params.set('style', updates.style);
    }

    if ('length' in updates) {
      if (!updates.length || updates.length === 'all') params.delete('length');
      else params.set('length', updates.length);
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  useEffect(() => {
    setQuery(initialQuery);
    setCategory(initialCategory);
    setStyle(initialStyle);
    setLength(initialLength);
    setStock(initialStock);
    setVisible(PAGE_SIZE);
  }, [initialCategory, initialLength, initialQuery, initialStock, initialStyle]);

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
        const matchesStyle = style === 'all' || product.styleTags.includes(style);
        const matchesLength = length === 'all' || product.lengths.includes(length);
        const matchesStock = stock === 'all' || (stock === 'in-stock' ? product.stock > 0 : product.stock === 0);
        const matchesPrice = price === 'all' || (product.maxPrice >= min && product.minPrice <= max);
        return matchesQuery && matchesCategory && matchesStyle && matchesLength && matchesStock && matchesPrice;
      })
      .sort((a, b) => {
        if (sort === 'newest') return products.indexOf(b) - products.indexOf(a);
        if (sort === 'price-asc') return a.minPrice - b.minPrice;
        if (sort === 'price-desc') return b.maxPrice - a.maxPrice;
        if (sort === 'name-desc') return b.name.localeCompare(a.name, 'vi');
        return a.name.localeCompare(b.name, 'vi');
      });
  }, [category, length, price, products, query, sort, stock, style]);

  const shown = filtered.slice(0, visible);
  const styleLabel = siteConfig.styles.find((item) => item.value === style)?.label;
  const pageTitle = category !== 'all' ? category : length !== 'all' ? `Dây ${length}` : styleLabel || 'Tất cả sản phẩm';
  const availableLengths = siteConfig.lengths.map((item) => item.label);

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
        styles={siteConfig.styles}
        style={style}
        lengths={availableLengths}
        length={length}
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
        onStyleChange={(value) => {
          setStyle(value);
          setVisible(PAGE_SIZE);
          updateUrl({ style: value });
        }}
        onLengthChange={(value) => {
          setLength(value);
          setVisible(PAGE_SIZE);
          updateUrl({ length: value });
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
