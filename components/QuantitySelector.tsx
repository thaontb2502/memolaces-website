'use client';

import { Minus, Plus } from 'lucide-react';

export function QuantitySelector({ value, max, onChange }: { value: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="inline-flex h-12 overflow-hidden rounded-lg border border-stone-200 bg-white">
      <button type="button" className="grid w-12 place-items-center text-stone-700 hover:bg-stone-50" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Giảm số lượng">
        <Minus size={17} />
      </button>
      <input
        value={value}
        onChange={(event) => onChange(Math.min(Math.max(1, Number(event.target.value) || 1), Math.max(1, max)))}
        className="w-14 border-x border-stone-200 text-center font-bold outline-none"
        inputMode="numeric"
        aria-label="Số lượng"
      />
      <button type="button" className="grid w-12 place-items-center text-stone-700 hover:bg-stone-50" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Tăng số lượng">
        <Plus size={17} />
      </button>
    </div>
  );
}
