import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="container-page flex flex-wrap items-center gap-2 py-5 text-sm text-stone-500" aria-label="Breadcrumb">
      <Link href="/" className="font-bold text-stone-700 hover:text-emerald-900">Trang chủ</Link>
      {items.map((item) => (
        <span key={`${item.label}-${item.href ?? 'current'}`} className="flex items-center gap-2">
          <ChevronRight size={15} />
          {item.href ? <Link href={item.href} className="font-bold text-stone-700 hover:text-emerald-900">{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
