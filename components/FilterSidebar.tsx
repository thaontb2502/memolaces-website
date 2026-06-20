'use client';

import type { SortOption } from '@/lib/types';

export function FilterSidebar({
  categories,
  category,
  styles,
  style,
  lengths,
  length,
  stock,
  price,
  sort,
  onCategoryChange,
  onStyleChange,
  onLengthChange,
  onStockChange,
  onPriceChange,
  onSortChange,
}: {
  categories: string[];
  category: string;
  styles: { label: string; value: string }[];
  style: string;
  lengths: string[];
  length: string;
  stock: string;
  price: string;
  sort: SortOption;
  onCategoryChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onLengthChange: (value: string) => void;
  onStockChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
}) {
  return (
    <aside className="min-w-0 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:sticky lg:top-28">
      <h2 className="mb-4 text-base font-black text-emerald-950">Bộ lọc sản phẩm</h2>
      <div className="grid gap-4">
        <label className="grid min-w-0 gap-2 text-sm font-bold text-stone-700">
          Danh mục
          <select value={category} onChange={(event) => onCategoryChange(event.target.value)} className="h-12 w-full min-w-0 rounded-lg border border-stone-200 bg-stone-50 px-3 font-normal outline-none focus:border-emerald-800">
            <option value="all">Tất cả</option>
            {categories.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold text-stone-700">
          Kiểu dây
          <select value={style} onChange={(event) => onStyleChange(event.target.value)} className="h-12 w-full min-w-0 rounded-lg border border-stone-200 bg-stone-50 px-3 font-normal outline-none focus:border-emerald-800">
            <option value="all">Tất cả kiểu dây</option>
            {styles.map((item) => (
              <option value={item.value} key={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold text-stone-700">
          Độ dài
          <select value={length} onChange={(event) => onLengthChange(event.target.value)} className="h-12 w-full min-w-0 rounded-lg border border-stone-200 bg-stone-50 px-3 font-normal outline-none focus:border-emerald-800">
            <option value="all">Mọi độ dài</option>
            {lengths.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold text-stone-700">
          Khoảng giá
          <select value={price} onChange={(event) => onPriceChange(event.target.value)} className="h-12 w-full min-w-0 rounded-lg border border-stone-200 bg-stone-50 px-3 font-normal outline-none focus:border-emerald-800">
            <option value="all">Mọi mức giá</option>
            <option value="0-100000">Dưới 100.000đ</option>
            <option value="100000-300000">100.000đ - 300.000đ</option>
            <option value="300000-700000">300.000đ - 700.000đ</option>
            <option value="700000-Infinity">Trên 700.000đ</option>
          </select>
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold text-stone-700">
          Trạng thái
          <select value={stock} onChange={(event) => onStockChange(event.target.value)} className="h-12 w-full min-w-0 rounded-lg border border-stone-200 bg-stone-50 px-3 font-normal outline-none focus:border-emerald-800">
            <option value="all">Tất cả</option>
            <option value="in-stock">Còn hàng</option>
            <option value="out-of-stock">Tạm hết hàng</option>
          </select>
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold text-stone-700">
          Sắp xếp
          <select value={sort} onChange={(event) => onSortChange(event.target.value as SortOption)} className="h-12 w-full min-w-0 rounded-lg border border-stone-200 bg-stone-50 px-3 font-normal outline-none focus:border-emerald-800">
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
          </select>
        </label>
      </div>
    </aside>
  );
}
