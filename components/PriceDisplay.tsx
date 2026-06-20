import { formatPriceRange } from '@/lib/format';

export function PriceDisplay({ minPrice, maxPrice, className = '' }: { minPrice: number; maxPrice: number; className?: string }) {
  return <span className={`font-black text-rose-700 ${className}`}>{formatPriceRange(minPrice, maxPrice)}</span>;
}
