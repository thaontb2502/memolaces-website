import { Breadcrumb } from '@/components/Breadcrumb';
import { CartPage } from '@/components/CartPage';

export default function CartRoute() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Giỏ hàng' }]} />
      <CartPage />
    </>
  );
}
