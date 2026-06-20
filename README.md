# Memolaces Shop

Website bán hàng local dùng React, TypeScript và Vite. Dữ liệu sản phẩm được lấy từ `src/data/catalog.json` và `src/data/catalog_banned.json`, sao chép từ bộ bàn giao/export hiện có.

## Chạy project

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal, mặc định là `http://127.0.0.1:5173/`.

## Kiểm tra

```bash
npm run lint
npm run build
```

## Nguồn dữ liệu

- `src/data/catalog.json`: nguồn chính cho giao diện catalog.
- `src/data/catalog_banned.json`: nguồn bổ sung, được gộp vào catalog để hiển thị đủ sản phẩm.
- `src/data/products.json`: dữ liệu gốc để đối chiếu khi cần.
- `src/data/products_banned.json`: dữ liệu gốc bổ sung để đối chiếu khi cần.
- `src/data/HANDOFF_README.md`: ghi chú từ bộ bàn giao.
