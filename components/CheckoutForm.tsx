'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clipboard, ClipboardCheck, MessageCircle, PackageCheck, PhoneCall } from 'lucide-react';
import { useCart } from './CartProvider';
import { EmptyState } from './EmptyState';
import { formatCurrency } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import type { CartItem } from '@/lib/types';

const ORDER_KEY = 'csv-commerce-orders';

const createOrderMessage = ({
  id,
  customer,
  items,
  total,
}: {
  id: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    note: string;
  };
  items: CartItem[];
  total: number;
}) => {
  const productLines = items.map((item, index) => [
    `${index + 1}. ${item.productName || item.name || 'Sản phẩm'}`,
    `   Phân loại: ${item.variantName}`,
    `   SKU: ${item.sku}`,
    `   Số lượng: ${item.quantity}`,
    `   Giá: ${formatCurrency(item.price)}`,
    `   Thành tiền: ${formatCurrency(item.price * item.quantity)}`,
  ].join('\n'));

  return [
    `ĐƠN HÀNG MEMOLACES`,
    `Mã đơn: ${id}`,
    '',
    `Họ tên: ${customer.fullName}`,
    `Số điện thoại/Zalo: ${customer.phone}`,
    customer.email ? `Email: ${customer.email}` : '',
    `Địa chỉ: ${customer.address}`,
    `Ghi chú: ${customer.note || 'Không có'}`,
    '',
    'Sản phẩm:',
    productLines.join('\n\n'),
    '',
    `Tổng tiền: ${formatCurrency(total)}`,
  ].filter(Boolean).join('\n');
};

export function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    note: '',
  });

  if (!items.length && !success) {
    return (
      <div className="container-page py-12">
        <EmptyState title="Chưa có sản phẩm để thanh toán" description="Giỏ hàng trống, bạn có thể quay lại danh sách sản phẩm để chọn món cần mua." actionHref="/products" actionLabel="Xem sản phẩm" />
      </div>
    );
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Vui lòng nhập họ tên.';
    if (!/^[0-9+\s-]{8,15}$/.test(form.phone.trim())) nextErrors.phone = 'Số điện thoại chưa hợp lệ.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Email chưa hợp lệ.';
    if (form.address.trim().length < 8) nextErrors.address = 'Vui lòng nhập địa chỉ chi tiết hơn.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const order = {
      id: `ORDER-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customer: form,
      items,
      total,
    };
    const message = createOrderMessage(order);

    const saved = window.localStorage.getItem(ORDER_KEY);
    const orders = saved ? JSON.parse(saved) : [];
    window.localStorage.setItem(ORDER_KEY, JSON.stringify([order, ...orders]));
    setOrderMessage(message);
    setCopyStatus('');
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(message).then(
        () => setCopyStatus('Đã copy nội dung đơn hàng. Bạn có thể mở Zalo và dán gửi cho shop.'),
        () => setCopyStatus('Bạn có thể bấm Copy đơn hàng rồi gửi qua Zalo cho shop.'),
      );
    } else {
      setCopyStatus('Bạn có thể bấm Copy đơn hàng rồi gửi qua Zalo cho shop.');
    }
    clearCart();
    setSuccess(order.id);
  };

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage);
      setCopyStatus('Đã copy nội dung đơn hàng.');
    } catch {
      setCopyStatus('Trình duyệt chưa cho copy tự động, bạn có thể chọn nội dung đơn bên dưới để copy thủ công.');
    }
  };

  if (success) {
    return (
      <div className="container-page py-12">
        <section className="rounded-lg border border-emerald-200 bg-white p-5 shadow-lg md:p-10">
          <CheckCircle2 className="mx-auto text-emerald-700" size={52} />
          <div className="text-center">
            <h1 className="mt-4 text-3xl font-black text-emerald-950">Đặt hàng thành công</h1>
            <p className="mt-3 text-stone-600">Mã đơn:</p>
            <p className="mx-auto mt-3 w-fit rounded-lg bg-emerald-50 px-5 py-3 font-mono text-lg font-black text-emerald-900">{success}</p>
            <p className="mt-3 text-sm text-stone-500">Đơn đã được lưu trong localStorage.</p>
            <p className="mt-2 text-sm font-bold text-emerald-800">Shop sẽ liên hệ xác nhận qua số điện thoại/Zalo trước khi giao hàng.</p>
          </div>
          <div className="mx-auto mt-6 max-w-3xl rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-black text-emerald-950">Nội dung gửi shop</h2>
              {copyStatus && <span className="text-sm font-bold text-emerald-700">{copyStatus}</span>}
            </div>
            <textarea
              readOnly
              value={orderMessage}
              className="mt-3 min-h-72 w-full rounded-lg border border-stone-200 bg-white p-3 font-mono text-sm leading-6 text-stone-800 outline-none"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={copyOrder} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-emerald-900 hover:bg-emerald-50">
                <Clipboard size={18} />
                Copy đơn hàng
              </button>
              <a href={siteConfig.zalo} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-rose-700">
                <MessageCircle size={18} />
                Gửi đơn qua Zalo
              </a>
              <Link href="/products" className="inline-flex items-center justify-center rounded-lg bg-emerald-900 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800">Tiếp tục mua hàng</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 py-10 lg:grid-cols-[1fr_390px]">
      <form onSubmit={submit} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-7">
        <h1 className="flex items-center gap-2 text-2xl font-black text-emerald-950"><ClipboardCheck size={24} /> Thông tin nhận hàng</h1>
        <div className="mt-4 flex gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-900">
          <PhoneCall size={20} className="mt-0.5 shrink-0" />
          <p>Sau khi đặt hàng, shop sẽ liên hệ xác nhận qua số điện thoại/Zalo. Website chưa thanh toán online, bạn chỉ cần để lại thông tin nhận hàng.</p>
        </div>
        <div className="mt-5 grid gap-4">
          {[
            ['fullName', 'Họ tên', 'Nguyễn Văn A'],
            ['phone', 'Số điện thoại', '0900000000'],
            ['email', 'Email', 'email@example.com'],
            ['address', 'Địa chỉ', 'Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành'],
          ].map(([key, label, placeholder]) => (
            <label key={key} className="grid gap-2 text-sm font-bold text-stone-700">
              {label}
              <input
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={placeholder}
                className="h-12 rounded-lg border border-stone-200 px-3 font-normal outline-none focus:border-emerald-800"
              />
              {errors[key] && <span className="text-xs font-bold text-rose-700">{errors[key]}</span>}
            </label>
          ))}
          <label className="grid gap-2 text-sm font-bold text-stone-700">
            Ghi chú
            <textarea
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              className="min-h-28 rounded-lg border border-stone-200 p-3 font-normal outline-none focus:border-emerald-800"
              placeholder="Ghi chú giao hàng hoặc yêu cầu riêng"
            />
          </label>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="submit" className="rounded-lg bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-rose-700">Đặt hàng</button>
          <a href={siteConfig.zalo} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-900 hover:bg-emerald-100">
            <MessageCircle size={18} />
            Liên hệ Zalo
          </a>
        </div>
      </form>

      <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5 shadow-lg lg:sticky lg:top-28">
        <h2 className="flex items-center gap-2 text-xl font-black text-emerald-950"><PackageCheck size={22} /> Tóm tắt đơn hàng</h2>
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-3 border-b border-stone-100 pb-3">
              <img src={item.image} alt={item.productName || item.name || 'Sản phẩm'} title={item.productName || item.name || 'Sản phẩm'} className="h-16 w-16 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-black text-emerald-950">{item.productName || item.name}</p>
                <p className="text-xs text-stone-500">{item.variantName} · SKU {item.sku}</p>
                <p className="text-sm font-bold text-rose-700">{item.quantity} x {formatCurrency(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-lg">
          <span className="font-bold">Tổng cộng</span>
          <strong className="text-rose-700">{formatCurrency(total)}</strong>
        </div>
      </aside>
    </div>
  );
}
