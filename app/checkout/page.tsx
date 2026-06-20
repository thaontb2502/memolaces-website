import { Breadcrumb } from '@/components/Breadcrumb';
import { CheckoutForm } from '@/components/CheckoutForm';

export default function CheckoutPage() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Giỏ hàng', href: '/cart' }, { label: 'Thanh toán' }]} />
      <CheckoutForm />
    </>
  );
}
