'use client';

import { Search } from 'lucide-react';

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-12 items-center rounded-lg border-2 border-emerald-900 bg-white px-3 shadow-sm">
      <Search size={18} className="text-stone-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Tìm theo tên sản phẩm, SKU, phân loại..."
        className="h-full flex-1 bg-transparent px-3 text-sm outline-none"
      />
    </label>
  );
}
