import { EmptyState } from '@/components/EmptyState';

export default function NotFound() {
  return (
    <div className="container-page py-12">
      <EmptyState title="Không tìm thấy trang" description="Trang hoặc sản phẩm bạn mở không tồn tại trong dữ liệu hiện tại." actionHref="/products" actionLabel="Quay lại sản phẩm" />
    </div>
  );
}
