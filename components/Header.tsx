'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Menu, Percent, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from './CartProvider';
import { siteConfig } from '@/lib/site-config';

const navItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/products?category=Dây%20Giày', label: 'Dây giày' },
  { href: '/products?category=Phụ%20Kiện%20Trang%20Trí', label: 'Phụ kiện' },
  { href: '/products?category=Vệ%20Sinh%20Giày', label: 'Vệ sinh' },
  { href: '/products?category=Bảo%20Quản%20Giày', label: 'Bảo quản' },
  { href: '/contact', label: 'Liên hệ' },
];

export function Header() {
  const router = useRouter();
  const { count } = useCart();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/products${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="border-b border-stone-100 bg-emerald-950 text-white">
        <div className="container-page flex min-h-9 items-center justify-between gap-3 text-xs font-bold">
          <span className="hidden sm:block">{siteConfig.slogan}</span>
          <span className="flex items-center gap-2"><Percent size={14} /> Freeship và ưu đãi theo chương trình shop</span>
          <span className="hidden md:block">Hotline: {siteConfig.phone}</span>
        </div>
      </div>
      <div className="container-page flex min-h-20 items-center gap-4">
        <Link href="/" className="flex min-w-fit items-center gap-3" aria-label={`${siteConfig.shopName} - Trang chủ`}>
          <img
            src="/images/brand/memolaces-logo.png"
            alt={siteConfig.shopName}
            title={siteConfig.shopName}
            className="h-10 w-36 object-contain sm:h-12 sm:w-44"
          />
          <span className="sr-only">{siteConfig.shopName}</span>
        </Link>

        <form onSubmit={submit} className="hidden h-12 flex-1 items-center rounded-lg border-2 border-emerald-900 bg-white px-3 shadow-sm md:flex">
          <Search size={18} className="text-stone-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm sản phẩm, SKU, phân loại..."
            className="h-full flex-1 bg-transparent px-3 text-sm outline-none"
          />
          <button type="submit" className="rounded-md bg-emerald-900 px-4 py-2 text-sm font-black text-white">Tìm</button>
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-4 py-2 text-sm font-bold text-stone-600 hover:bg-emerald-50 hover:text-emerald-950">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/cart" className="relative grid h-12 w-12 place-items-center rounded-lg border border-stone-200 bg-white text-emerald-950 shadow-sm transition hover:border-emerald-900 hover:bg-emerald-50" aria-label="Giỏ hàng">
          <ShoppingBag size={20} />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 grid min-w-6 place-items-center rounded-full bg-rose-600 px-1.5 py-0.5 text-xs font-black text-white">
              {count}
            </span>
          )}
        </Link>

        <button type="button" className="grid h-12 w-12 place-items-center rounded-lg border border-stone-200 bg-white lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Mở menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200 bg-[#f7f3ec] p-4 lg:hidden">
          <form onSubmit={submit} className="mb-3 flex items-center rounded-lg border border-stone-200 bg-white px-3">
            <Search size={18} className="text-stone-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sản phẩm..." className="h-11 flex-1 bg-transparent px-3 text-sm outline-none" />
          </form>
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-stone-700">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
