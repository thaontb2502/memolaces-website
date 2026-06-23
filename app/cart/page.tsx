import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CartPage } from '@/components/CartPage';

export const metadata: Metadata = {
  title: { absolute: 'Giỏ Hàng | MEMOLACES' },
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: true },
};

export default function CartRoute() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Giỏ hàng' }]} />
      <CartPage />
    </>
  );
}
