import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CheckoutForm } from '@/components/CheckoutForm';

export const metadata: Metadata = {
  title: { absolute: 'Thanh Toán | MEMOLACES' },
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Giỏ hàng', href: '/cart' }, { label: 'Thanh toán' }]} />
      <CheckoutForm />
    </>
  );
}
