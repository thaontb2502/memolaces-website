'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Clipboard, Mail, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

const emptyForm = {
  fullName: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
};

export function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const hasEmail = Boolean(siteConfig.email && siteConfig.email !== 'email@example.com');

  const contactMessage = useMemo(
    () => [
      'YÊU CẦU TƯ VẤN MEMOLACES',
      `Họ tên: ${form.fullName || 'Chưa nhập'}`,
      `Số điện thoại: ${form.phone || 'Chưa nhập'}`,
      form.email ? `Email: ${form.email}` : '',
      `Chủ đề: ${form.subject || 'Chưa nhập'}`,
      '',
      'Nội dung:',
      form.message || 'Chưa nhập',
    ].filter(Boolean).join('\n'),
    [form],
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Vui lòng nhập họ tên.';
    if (!/^[0-9+\s-]{8,15}$/.test(form.phone.trim())) nextErrors.phone = 'Số điện thoại chưa hợp lệ.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Email chưa hợp lệ.';
    if (!form.subject.trim()) nextErrors.subject = 'Vui lòng nhập chủ đề.';
    if (form.message.trim().length < 5) nextErrors.message = 'Vui lòng nhập nội dung cần tư vấn.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const copyMessage = async () => {
    if (!validate()) return false;
    try {
      await navigator.clipboard.writeText(contactMessage);
      setStatus('Đã copy nội dung. Bạn có thể dán và gửi cho shop qua Zalo.');
      return true;
    } catch {
      setStatus('Trình duyệt chưa cho phép copy tự động. Hãy chọn nội dung bên dưới để copy.');
      return false;
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void copyMessage();
  };

  const sendViaZalo = () => {
    if (!validate()) return;
    window.open(siteConfig.zalo, '_blank', 'noopener,noreferrer');
    void copyMessage();
  };

  const emailHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent(form.subject || 'Tư vấn sản phẩm MEMOLACES')}&body=${encodeURIComponent(contactMessage)}`;

  return (
    <form onSubmit={submit} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-7">
      <span className="text-sm font-black uppercase tracking-wide text-emerald-700">Yêu cầu tư vấn</span>
      <h2 className="mt-2 text-2xl font-black text-emerald-950">Gửi thông tin cho MEMOLACES</h2>
      <p className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-900">
        Vui lòng gửi nội dung qua Zalo để shop tiếp nhận yêu cầu.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          ['fullName', 'Họ tên', 'Nguyễn Văn A'],
          ['phone', 'Số điện thoại', '0900000000'],
          ['email', 'Email (không bắt buộc)', 'email@example.com'],
          ['subject', 'Chủ đề', 'Tư vấn chọn độ dài dây'],
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
      </div>

      <label className="mt-4 grid gap-2 text-sm font-bold text-stone-700">
        Nội dung
        <textarea
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          placeholder="Mẫu giày, số lỗ xỏ, màu sắc hoặc sản phẩm bạn cần tư vấn..."
          className="min-h-32 rounded-lg border border-stone-200 p-3 font-normal outline-none focus:border-emerald-800"
        />
        {errors.message && <span className="text-xs font-bold text-rose-700">{errors.message}</span>}
      </label>

      <label className="mt-4 grid gap-2 text-sm font-bold text-stone-700">
        Nội dung sẽ gửi
        <textarea readOnly value={contactMessage} className="min-h-48 rounded-lg border border-stone-200 bg-stone-50 p-3 font-mono text-xs font-normal leading-5 text-stone-700" />
      </label>

      {status && <p role="status" className="mt-3 text-sm font-bold text-emerald-700">{status}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-emerald-900 hover:bg-emerald-50">
          <Clipboard size={18} /> Copy nội dung
        </button>
        <button type="button" onClick={sendViaZalo} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-900 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800">
          <MessageCircle size={18} /> Gửi qua Zalo
        </button>
        {hasEmail && (
          <a href={emailHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-stone-200 px-5 py-3 text-sm font-black text-stone-700 sm:col-span-2">
            <Mail size={18} /> Gửi qua email
          </a>
        )}
      </div>
    </form>
  );
}
