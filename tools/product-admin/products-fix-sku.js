#!/usr/bin/env node
import { fixVariantSkus } from './product-data.js';

const result = fixVariantSkus();

console.log('MEMOLACES SKU fix');
console.log(`- SKU thiếu đã được tạo: ${result.missingCreated}`);
console.log(`- SKU trùng đã được sửa: ${result.duplicateFixed}`);
console.log(`- Tổng dòng variant đã đổi: ${result.changed}`);

if (result.backups.length) {
  console.log('- Backup đã tạo:');
  result.backups.forEach((file) => console.log(`  ${file}`));
} else {
  console.log('- Không cần ghi CSV, không tạo backup mới.');
}

if (result.changes.length) {
  console.log('- Một số thay đổi đầu tiên:');
  result.changes.slice(0, 20).forEach((change) => {
    const from = change.from || '(trống)';
    console.log(`  dòng ${change.row}: ${change.product_id} / ${change.variation_id} / ${from} -> ${change.to}`);
  });
  if (result.changes.length > 20) {
    console.log(`  ... và ${result.changes.length - 20} dòng khác`);
  }
}

