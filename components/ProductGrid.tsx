import type { Product } from '@/lib/types';
import { EmptyState } from './EmptyState';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <EmptyState
        title="Chưa có sản phẩm phù hợp"
        description="Bạn thử đổi từ khóa tìm kiếm, bộ lọc giá hoặc trạng thái hàng."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
}
