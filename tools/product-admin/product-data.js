import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ROOT = path.resolve(new URL('../../', import.meta.url).pathname);
export const PRODUCT_FILE = 'shopee_products_for_website.csv';
export const VARIANT_FILE = 'shopee_variants_for_website.csv';
export const IMAGE_FILE = 'shopee_images_local.csv';
export const PRODUCT_IMAGE_ROOT = path.join(ROOT, 'public/images/products');
export const BACKUP_DIR = path.join(ROOT, 'backups/products');

export const CATEGORY_OPTIONS = ['Dây Giày', 'Phụ Kiện Trang Trí', 'Vệ Sinh Giày', 'Bảo Quản Giày'];
export const STATUS_OPTIONS = ['active', 'hidden', 'out_stock', 'featured', 'new', 'sale'];

const CSV_FILES = [PRODUCT_FILE, VARIANT_FILE, IMAGE_FILE];

export const normalizeHeader = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^\uFEFF/, '')
    .replace(/[\s-]+/g, '_');

export const normalizeText = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizeLookup = (value) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const parseCsv = (content) => {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((cells) => cells.some((cell) => String(cell).trim()));
  const headers = (nonEmptyRows[0] ?? []).map((header) => header.replace(/^\uFEFF/, '').trim());

  return {
    headers,
    rows: nonEmptyRows.slice(1).map((cells) =>
      headers.reduce((record, header, index) => {
        record[header] = (cells[index] ?? '').trim();
        return record;
      }, {}),
    ),
  };
};

export const stringifyCsv = (headers, rows) => {
  const escapeCell = (value) => {
    const raw = String(value ?? '');
    return /[",\n\r]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
  };

  const body = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))]
    .map((cells) => cells.map(escapeCell).join(','))
    .join('\n');

  return `\uFEFF${body}\n`;
};

export const readCsvFile = (fileName) => {
  const filePath = path.join(ROOT, fileName);
  const parsed = parseCsv(fs.readFileSync(filePath, 'utf8'));
  return { fileName, filePath, ...parsed };
};

export const readStore = () => ({
  products: readCsvFile(PRODUCT_FILE),
  variants: readCsvFile(VARIANT_FILE),
  images: readCsvFile(IMAGE_FILE),
});

export const writeCsvFile = (fileName, headers, rows) => {
  fs.writeFileSync(path.join(ROOT, fileName), stringifyCsv(headers, rows), 'utf8');
};

export const fieldName = (headers, aliases, fallback) => {
  const normalized = new Map(headers.map((header) => [normalizeHeader(header), header]));
  for (const alias of aliases) {
    const header = normalized.get(normalizeHeader(alias));
    if (header) return header;
  }
  return fallback ?? aliases[0];
};

export const valueOf = (row, aliases) => {
  const normalized = new Map(Object.keys(row).map((header) => [normalizeHeader(header), header]));
  for (const alias of aliases) {
    const header = normalized.get(normalizeHeader(alias));
    const value = header ? row[header] : '';
    if (value) return value;
  }
  return '';
};

export const productIdOf = (row) => valueOf(row, ['product_id', 'item_id', 'id', 'product id', 'item id']);
export const variantSkuOf = (row) =>
  valueOf(row, ['variation_sku', 'sku', 'SKU', 'model_sku', 'seller_sku', 'parent_sku']);

const variantSkuHeader = (headers) => fieldName(headers, ['variation_sku', 'sku', 'SKU', 'model_sku', 'seller_sku'], 'variation_sku');

export const makeVariantSku = (productId, index) => `${productId || 'MEMO'}-${index}`;

const makeUniqueSku = (baseSku, usedSkus) => {
  const cleanBase = String(baseSku || 'MEMO-SKU').trim();
  if (!usedSkus.has(cleanBase)) return cleanBase;

  let suffix = 2;
  while (usedSkus.has(`${cleanBase}-${suffix}`)) suffix += 1;
  return `${cleanBase}-${suffix}`;
};

const getProductVariantIndexes = (rows) => {
  const counts = new Map();
  return rows.map((row, fallbackIndex) => {
    const productId = productIdOf(row) || 'MEMO';
    const nextIndex = (counts.get(productId) ?? 0) + 1;
    counts.set(productId, nextIndex);
    return productId ? nextIndex : fallbackIndex + 1;
  });
};

export const parseNumber = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;

  let normalized = raw.replace(/[₫đ\s]/gi, '').replace(/[^\d,.-]/g, '');
  const isNegative = normalized.startsWith('-');
  normalized = normalized.replace(/^-/, '');

  const commaCount = (normalized.match(/,/g) ?? []).length;
  const dotCount = (normalized.match(/\./g) ?? []).length;

  if (/^\d{1,3}([,.]\d{3})+$/.test(normalized)) {
    normalized = normalized.replace(/[,.]/g, '');
  } else if (commaCount > 0 && dotCount > 0) {
    const lastComma = normalized.lastIndexOf(',');
    const lastDot = normalized.lastIndexOf('.');
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
    const decimalDigits = normalized.length - Math.max(lastComma, lastDot) - 1;
    normalized = normalized.replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '');
    normalized =
      decimalDigits === 3
        ? normalized.replace(/[,.]/g, '')
        : normalized.replace(decimalSeparator, '.');
  } else if (commaCount === 1 && dotCount === 0) {
    const decimalDigits = normalized.length - normalized.lastIndexOf(',') - 1;
    normalized = decimalDigits === 3 ? normalized.replace(',', '') : normalized.replace(',', '.');
  } else if (dotCount === 1 && commaCount === 0) {
    const decimalDigits = normalized.length - normalized.lastIndexOf('.') - 1;
    normalized = decimalDigits === 3 ? normalized.replace('.', '') : normalized;
  } else {
    normalized = normalized.replace(/[,.]/g, '');
  }

  const parsed = Number(`${isNegative ? '-' : ''}${normalized}`);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const parseInteger = (value) => Math.max(0, Math.floor(parseNumber(value)));

export const brandCategoryFrom = (rawCategory, name) => {
  const rawLookup = normalizeLookup(rawCategory);
  const lookup = normalizeLookup(`${rawCategory} ${name}`);

  if (
    /\b(shoe laces|shoelace|shoelaces|laces|lace|day giay|day oval|day flat|day tron|reflective lace|custom lace)\b/.test(
      lookup,
    )
  ) {
    return 'Dây Giày';
  }

  if (
    /\b(shoe care|cleaning|cleaner|brush|care supplies|home care|wash|ve sinh|ban chai|khan lau|dung dich|microfiber|kit cham soc)\b/.test(
      lookup,
    )
  ) {
    return 'Vệ Sinh Giày';
  }

  if (
    /\b(storage|organizer|organizers|bag|box|bao quan|hop|tui dung|hut am|chong nhan|shoe storage|shoe box|storage box)\b/.test(
      lookup,
    )
  ) {
    return 'Bảo Quản Giày';
  }

  if (
    /\b(charm|tag|tip|dau tip|khoa|phu kien trang tri|phu kien|trang tri|decoration|decor|clock|dong ho|lace tag|lacetag|accessory|accessories)\b/.test(
      lookup,
    )
  ) {
    return 'Phụ Kiện Trang Trí';
  }

  if (/\b(decoration|decor|clock|clocks)\b/.test(rawLookup)) {
    return 'Phụ Kiện Trang Trí';
  }

  return 'Phụ Kiện Trang Trí';
};

export const categoryOfProduct = (row) =>
  brandCategoryFrom(valueOf(row, ['category', 'category_name', 'category_shopee', 'collection', 'nganh_hang', 'danh_muc']), valueOf(row, ['name', 'product_name', 'title', 'ten_san_pham']));

const nowStamp = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(now)
    .replace(' ', '-')
    .replace(/:/g, '');
  return parts;
};

export const createBackups = () => {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = nowStamp();
  const backups = [];

  for (const fileName of CSV_FILES) {
    const source = path.join(ROOT, fileName);
    if (!fs.existsSync(source)) continue;
    const target = path.join(BACKUP_DIR, `${stamp}-${fileName}`);
    fs.copyFileSync(source, target);
    backups.push(target);
  }

  return backups;
};

export const makeProductId = () => {
  const now = new Date();
  const stamp = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(now)
    .replace(/\D/g, '');
  return `MEMO${stamp}`;
};

export const safeFileName = (input) => {
  const parsed = path.parse(input || 'image');
  const base =
    normalizeText(parsed.name)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'image';
  const ext = normalizeText(parsed.ext || '.jpg').replace(/[^.a-z0-9]/g, '') || '.jpg';
  return `${base}${ext}`;
};

export const copyUploadedFile = (file, productId, prefix = 'image') => {
  const productDir = path.join(PRODUCT_IMAGE_ROOT, productId);
  fs.mkdirSync(productDir, { recursive: true });
  const safeName = safeFileName(file.originalname);
  const ext = path.extname(safeName) || '.jpg';
  const base = path.basename(safeName, ext);
  const finalName = `${productId}-${prefix}-${base}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const target = path.join(productDir, finalName);
  fs.copyFileSync(file.path, target);
  fs.rmSync(file.path, { force: true });
  return `/images/products/${productId}/${finalName}`;
};

export const publicImageExists = (localPath) => {
  if (!localPath || !localPath.startsWith('/images/products/')) return false;
  return fs.existsSync(path.join(ROOT, 'public', localPath.replace(/^\//, '')));
};

const removePublicImages = (localPaths) => {
  for (const localPath of localPaths) {
    if (!localPath || !localPath.startsWith('/images/products/')) continue;
    fs.rmSync(path.join(ROOT, 'public', localPath.replace(/^\//, '')), { force: true });
  }
};

const normalizeStatuses = (value) =>
  String(value ?? '')
    .split(/[,\s|]+/)
    .map((status) => status.trim())
    .filter((status) => STATUS_OPTIONS.includes(status));

const statusOfProduct = (row) => {
  const statuses = normalizeStatuses(valueOf(row, ['suggested_web_status', 'status', 'web_status']));
  return statuses.length ? statuses : ['active'];
};

const getImageSortNumber = (imageType) => {
  if (imageType === 'cover') return 0;
  const number = Number(String(imageType).match(/\d+/)?.[0] ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const sortByNumber = (items, getter) =>
  [...items].sort((a, b) => parseInteger(getter(a)) - parseInteger(getter(b)));

export const listProducts = () => {
  const store = readStore();
  const imageRowsByProduct = new Map();
  const variantRowsByProduct = new Map();
  const skuByProduct = new Map();

  for (const row of store.images.rows) {
    const id = productIdOf(row);
    if (!id) continue;
    const list = imageRowsByProduct.get(id) ?? [];
    list.push(row);
    imageRowsByProduct.set(id, list);
  }

  for (const row of store.variants.rows) {
    const id = productIdOf(row);
    if (!id) continue;
    const list = variantRowsByProduct.get(id) ?? [];
    list.push(row);
    variantRowsByProduct.set(id, list);
    const sku = variantSkuOf(row);
    if (sku) {
      const skuList = skuByProduct.get(id) ?? [];
      skuList.push(sku);
      skuByProduct.set(id, skuList);
    }
  }

  const products = store.products.rows.map((row) => {
    const id = productIdOf(row);
    const variants = variantRowsByProduct.get(id) ?? [];
    const prices = variants.map((variant) => parseNumber(valueOf(variant, ['price_vnd', 'price', 'gia']))).filter((price) => price > 0);
    const stock =
      variants.length > 0
        ? variants.reduce((sum, variant) => sum + parseInteger(valueOf(variant, ['stock', 'quantity', 'ton_kho', 'normal_stock'])), 0)
        : parseInteger(valueOf(row, ['total_stock', 'stock', 'quantity', 'ton_kho']));
    const productSku = valueOf(row, ['parent_sku', 'sku', 'SKU', 'seller_sku']);

    return {
      product_id: id,
      product_name: valueOf(row, ['product_name', 'name', 'title', 'ten_san_pham']),
      category: categoryOfProduct(row),
      raw_category: valueOf(row, ['category_shopee', 'category', 'category_name', 'danh_muc']),
      price_min_vnd: prices.length ? Math.min(...prices) : parseNumber(valueOf(row, ['price_min_vnd', 'price_vnd', 'price'])),
      price_max_vnd: prices.length ? Math.max(...prices) : parseNumber(valueOf(row, ['price_max_vnd', 'price_vnd', 'price'])),
      total_stock: stock,
      image_count: imageRowsByProduct.get(id)?.length ?? 0,
      variant_count: variants.length,
      status: statusOfProduct(row),
      skus: [productSku, ...(skuByProduct.get(id) ?? [])].filter(Boolean),
    };
  });

  return { products, categories: CATEGORY_OPTIONS };
};

export const getProductDetail = (productId) => {
  const store = readStore();
  const product = store.products.rows.find((row) => productIdOf(row) === productId);
  if (!product) return null;

  const variants = store.variants.rows
    .filter((row) => productIdOf(row) === productId)
    .map((row) => ({
      variation_id: valueOf(row, ['variation_id', 'variant_id', 'model_id', 'id']),
      variation_name: valueOf(row, ['variation_name', 'variant_name', 'model_name', 'ten_phan_loai']),
      parent_sku: valueOf(row, ['parent_sku']),
      variation_sku: variantSkuOf(row),
      price_vnd: parseNumber(valueOf(row, ['price_vnd', 'price', 'gia'])),
      stock: parseInteger(valueOf(row, ['stock', 'quantity', 'ton_kho', 'normal_stock'])),
      source_note: valueOf(row, ['source_note']),
    }));

  const imageRows = store.images.rows
    .filter((row) => productIdOf(row) === productId)
    .map((row) => ({
      image_type: valueOf(row, ['image_type']),
      option_name: valueOf(row, ['option_name']),
      image_url: valueOf(row, ['image_url']),
      local_image_path: valueOf(row, ['local_image_path']),
      exists: publicImageExists(valueOf(row, ['local_image_path'])),
    }));

  const cover = imageRows.find((image) => image.image_type === 'cover')?.local_image_path || valueOf(product, ['cover_image']);
  const gallery = imageRows
    .filter((image) => image.image_type.startsWith('gallery'))
    .map((image) => image.local_image_path);
  const variantImages = imageRows
    .filter((image) => image.option_name)
    .map((image) => ({ option_name: image.option_name, local_image_path: image.local_image_path }));

  return {
    product_id: productId,
    product_name: valueOf(product, ['product_name', 'name', 'title', 'ten_san_pham']),
    description: valueOf(product, ['description', 'product_description', 'mo_ta']),
    category: categoryOfProduct(product),
    raw_category: valueOf(product, ['category_shopee', 'category', 'category_name', 'danh_muc']),
    status: statusOfProduct(product),
    parent_sku: valueOf(product, ['parent_sku', 'sku', 'SKU', 'seller_sku']),
    cover_image: cover,
    gallery_images: gallery,
    variants,
    variant_images: variantImages,
    image_rows: imageRows,
  };
};

export const validateProductPayload = (payload, productId, images) => {
  const errors = [];
  const name = String(payload.product_name ?? '').trim();
  const variants = Array.isArray(payload.variants) ? payload.variants.filter((variant) => !variant.deleted) : [];
  const localPaths = images.filter(Boolean);

  if (!name) errors.push('Tên sản phẩm không được trống.');
  if (!CATEGORY_OPTIONS.includes(payload.category)) errors.push('Danh mục không hợp lệ.');
  if (variants.length === 0) errors.push('Cần ít nhất một phân loại.');
  const statuses = Array.isArray(payload.status) ? payload.status : normalizeStatuses(payload.status);
  const invalidStatuses = statuses.filter((status) => !STATUS_OPTIONS.includes(status));
  if (invalidStatuses.length) errors.push(`Trạng thái không hợp lệ: ${invalidStatuses.join(', ')}.`);

  for (const [index, variant] of variants.entries()) {
    const price = parseNumber(variant.price_vnd);
    const stock = parseInteger(variant.stock);
    if (price <= 0) errors.push(`Phân loại ${index + 1}: giá phải là số > 0.`);
    if (stock < 0) errors.push(`Phân loại ${index + 1}: tồn kho phải là số >= 0.`);
    if (!String(variant.variation_sku ?? '').trim()) errors.push(`Phân loại ${index + 1}: SKU không được trống.`);
  }

  for (const localPath of localPaths) {
    if (!localPath.startsWith('/images/products/')) {
      errors.push(`Đường dẫn ảnh không hợp lệ: ${localPath}`);
    }
  }

  if (productId && !String(productId).trim()) errors.push('product_id không hợp lệ.');

  return errors;
};

const setValue = (row, headers, aliases, value) => {
  const header = fieldName(headers, aliases, aliases[0]);
  if (!headers.includes(header)) headers.push(header);
  row[header] = value ?? '';
};

const firstOption = (variationName) => String(variationName ?? '').split(',')[0].split('/')[0].trim();

export const saveProduct = ({ productId, payload, files }) => {
  const isNew = !productId;
  const finalProductId = productId || makeProductId();
  const store = readStore();
  const copiedImagePaths = [];
  const coverFile = files.find((file) => file.fieldname === 'coverFile');
  const galleryFiles = files.filter((file) => file.fieldname === 'galleryFiles');
  const variantFiles = new Map(
    files
      .filter((file) => file.fieldname.startsWith('variantImage:'))
      .map((file) => [Number(file.fieldname.split(':')[1]), file]),
  );

  const copyAndTrack = (file, prefix) => {
    const localPath = copyUploadedFile(file, finalProductId, prefix);
    copiedImagePaths.push(localPath);
    return localPath;
  };

  const uploadedCover = coverFile ? copyAndTrack(coverFile, 'cover') : '';
  const uploadedGallery = galleryFiles.map((file, index) => copyAndTrack(file, `gallery-${index + 1}`));
  const variants = (Array.isArray(payload.variants) ? payload.variants : []).filter((variant) => !variant.deleted);
  const variantsWithImages = variants.map((variant, index) => {
    const uploaded = variantFiles.get(index);
    return {
      ...variant,
      image_path: uploaded ? copyAndTrack(uploaded, `variant-${index + 1}`) : variant.image_path || '',
    };
  });
  const usedSkus = new Set(
    store.variants.rows
      .filter((row) => productIdOf(row) !== finalProductId)
      .map(variantSkuOf)
      .filter(Boolean),
  );
  const assignedSkus = new Set();
  const variantsWithSkus = variantsWithImages.map((variant, index) => {
    const enteredSku = String(variant.variation_sku ?? '').trim();
    const variation_sku = enteredSku || makeUniqueSku(makeVariantSku(finalProductId, index + 1), new Set([...usedSkus, ...assignedSkus]));
    assignedSkus.add(variation_sku);
    return { ...variant, variation_sku };
  });

  const galleryPaths = [...(Array.isArray(payload.gallery_images) ? payload.gallery_images : []), ...uploadedGallery]
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);
  const coverPath = uploadedCover || String(payload.cover_image ?? '').trim() || galleryPaths[0] || variantsWithSkus.find((variant) => variant.image_path)?.image_path || '';
  const imagePaths = [coverPath, ...galleryPaths, ...variantsWithSkus.map((variant) => variant.image_path)].filter(Boolean);
  const errors = validateProductPayload({ ...payload, variants: variantsWithSkus }, finalProductId, imagePaths);
  if (errors.length) {
    for (const file of files) fs.rmSync(file.path, { force: true });
    removePublicImages(copiedImagePaths);
    return { ok: false, status: 400, errors };
  }

  if (isNew && store.products.rows.some((row) => productIdOf(row) === finalProductId)) {
    removePublicImages(copiedImagePaths);
    return { ok: false, status: 409, errors: [`product_id đã tồn tại: ${finalProductId}`] };
  }

  const duplicateSkus = findDuplicateSkus(store, finalProductId, variantsWithSkus.map((variant) => variant.variation_sku));
  if (duplicateSkus.length) {
    removePublicImages(copiedImagePaths);
    return { ok: false, status: 400, errors: [`SKU bị trùng: ${duplicateSkus.join(', ')}`] };
  }

  const backups = createBackups();
  const productHeaders = [...store.products.headers];
  const variantHeaders = [...store.variants.headers];
  const imageHeaders = [...store.images.headers];
  const productRows = store.products.rows.filter((row) => productIdOf(row) !== finalProductId);
  const variantRows = store.variants.rows.filter((row) => productIdOf(row) !== finalProductId);
  const imageRows = store.images.rows.filter((row) => productIdOf(row) !== finalProductId);
  const prices = variantsWithSkus.map((variant) => parseNumber(variant.price_vnd));
  const stock = variantsWithSkus.reduce((sum, variant) => sum + parseInteger(variant.stock), 0);

  const productRow = {};
  setValue(productRow, productHeaders, ['product_id'], finalProductId);
  setValue(productRow, productHeaders, ['parent_sku'], payload.parent_sku || variantsWithSkus[0]?.variation_sku || '');
  setValue(productRow, productHeaders, ['product_name'], payload.product_name);
  setValue(productRow, productHeaders, ['category_shopee'], payload.category);
  setValue(productRow, productHeaders, ['description'], payload.description || '');
  setValue(productRow, productHeaders, ['cover_image'], coverPath);
  setValue(productRow, productHeaders, ['gallery_images'], galleryPaths.join('|'));
  setValue(productRow, productHeaders, ['price_min_vnd'], Math.min(...prices));
  setValue(productRow, productHeaders, ['price_max_vnd'], Math.max(...prices));
  setValue(productRow, productHeaders, ['total_stock'], stock);
  setValue(productRow, productHeaders, ['variant_count'], variantsWithSkus.length);
  setValue(productRow, productHeaders, ['suggested_web_status'], normalizeStatuses(payload.status).join(',') || 'active');
  setValue(productRow, productHeaders, ['source_note'], isNew ? 'Tạo bằng MEMOLACES local product admin' : 'Cập nhật bằng MEMOLACES local product admin');

  productRows.push(productRow);

  variantsWithSkus.forEach((variant, index) => {
    const row = {};
    setValue(row, variantHeaders, ['product_id'], finalProductId);
    setValue(row, variantHeaders, ['variation_id'], variant.variation_id || `${finalProductId}-V${index + 1}`);
    setValue(row, variantHeaders, ['product_name'], payload.product_name);
    setValue(row, variantHeaders, ['variation_name'], variant.variation_name || 'Mặc định');
    setValue(row, variantHeaders, ['parent_sku'], payload.parent_sku || '');
    setValue(row, variantHeaders, ['variation_sku'], variant.variation_sku);
    setValue(row, variantHeaders, ['price_vnd'], parseNumber(variant.price_vnd));
    setValue(row, variantHeaders, ['stock'], parseInteger(variant.stock));
    setValue(row, variantHeaders, ['gtin'], variant.gtin || '');
    setValue(row, variantHeaders, ['variation_image'], '');
    setValue(row, variantHeaders, ['source_note'], 'MEMOLACES local product admin');
    variantRows.push(row);
  });

  const addImageRow = ({ imageType, optionName = '', localPath }) => {
    if (!localPath) return;
    const row = {};
    setValue(row, imageHeaders, ['product_id'], finalProductId);
    setValue(row, imageHeaders, ['product_name'], payload.product_name);
    setValue(row, imageHeaders, ['image_type'], imageType);
    setValue(row, imageHeaders, ['option_name'], optionName);
    setValue(row, imageHeaders, ['image_url'], '');
    setValue(row, imageHeaders, ['local_image_path'], localPath);
    imageRows.push(row);
  };

  addImageRow({ imageType: 'cover', localPath: coverPath });
  galleryPaths.forEach((localPath, index) => addImageRow({ imageType: `gallery_${index + 1}`, localPath }));
  variantsWithSkus.forEach((variant, index) => {
    if (!variant.image_path) return;
    addImageRow({
      imageType: `variant_${index + 1}`,
      optionName: firstOption(variant.variation_name),
      localPath: variant.image_path,
    });
  });

  writeCsvFile(PRODUCT_FILE, productHeaders, productRows);
  writeCsvFile(VARIANT_FILE, variantHeaders, variantRows);
  writeCsvFile(IMAGE_FILE, imageHeaders, imageRows);

  return { ok: true, productId: finalProductId, backups };
};

export const bulkUpdateVariants = ({ productIds, price, stock }) => {
  const ids = new Set((Array.isArray(productIds) ? productIds : []).map(String).filter(Boolean));
  if (ids.size === 0) return { ok: false, status: 400, errors: ['Chưa chọn sản phẩm để sửa hàng loạt.'] };

  const hasPrice = price !== '' && price !== null && price !== undefined;
  const hasStock = stock !== '' && stock !== null && stock !== undefined;
  const nextPrice = hasPrice ? parseNumber(price) : null;
  const nextStock = hasStock ? parseInteger(stock) : null;
  if (!hasPrice && !hasStock) return { ok: false, status: 400, errors: ['Cần nhập giá hoặc tồn kho mới.'] };
  if (hasPrice && (!Number.isFinite(nextPrice) || nextPrice <= 0)) return { ok: false, status: 400, errors: ['Giá phải là số > 0.'] };
  if (hasStock && (!Number.isFinite(nextStock) || nextStock < 0)) return { ok: false, status: 400, errors: ['Tồn kho phải là số >= 0.'] };

  const store = readStore();
  const variantHeaders = [...store.variants.headers];
  const productHeaders = [...store.products.headers];
  const priceHeader = fieldName(variantHeaders, ['price_vnd', 'price', 'gia'], 'price_vnd');
  const stockHeader = fieldName(variantHeaders, ['stock', 'quantity', 'ton_kho', 'normal_stock'], 'stock');
  if (!variantHeaders.includes(priceHeader)) variantHeaders.push(priceHeader);
  if (!variantHeaders.includes(stockHeader)) variantHeaders.push(stockHeader);

  let changedVariants = 0;
  const variantRows = store.variants.rows.map((row) => {
    if (!ids.has(productIdOf(row))) return row;
    const next = { ...row };
    if (hasPrice) next[priceHeader] = nextPrice;
    if (hasStock) next[stockHeader] = nextStock;
    changedVariants += 1;
    return next;
  });

  if (changedVariants === 0) return { ok: false, status: 404, errors: ['Không tìm thấy variant thuộc sản phẩm đã chọn.'] };

  const variantsByProduct = new Map();
  for (const row of variantRows) {
    const id = productIdOf(row);
    if (!id || !ids.has(id)) continue;
    const list = variantsByProduct.get(id) ?? [];
    list.push(row);
    variantsByProduct.set(id, list);
  }

  const productRows = store.products.rows.map((row) => {
    const id = productIdOf(row);
    const variants = variantsByProduct.get(id);
    if (!variants) return row;
    const prices = variants.map((variant) => parseNumber(valueOf(variant, ['price_vnd', 'price', 'gia']))).filter((value) => value > 0);
    const totalStock = variants.reduce((sum, variant) => sum + parseInteger(valueOf(variant, ['stock', 'quantity', 'ton_kho', 'normal_stock'])), 0);
    const next = { ...row };
    setValue(next, productHeaders, ['price_min_vnd'], prices.length ? Math.min(...prices) : '');
    setValue(next, productHeaders, ['price_max_vnd'], prices.length ? Math.max(...prices) : '');
    setValue(next, productHeaders, ['total_stock'], totalStock);
    setValue(next, productHeaders, ['variant_count'], variants.length);
    return next;
  });

  const backups = createBackups();
  writeCsvFile(VARIANT_FILE, variantHeaders, variantRows);
  writeCsvFile(PRODUCT_FILE, productHeaders, productRows);

  return { ok: true, changedVariants, productCount: ids.size, backups };
};

export const addProductImages = ({ productId, files, imageType = 'gallery', optionName = '' }) => {
  const store = readStore();
  const product = store.products.rows.find((row) => productIdOf(row) === productId);
  if (!product) return { ok: false, status: 404, errors: ['Không tìm thấy sản phẩm để thêm ảnh.'] };
  if (!files.length) return { ok: false, status: 400, errors: ['Chưa chọn file ảnh.'] };

  const normalizedType = imageType === 'cover' ? 'cover' : 'gallery';
  const copiedImagePaths = [];
  const backups = createBackups();

  try {
    files.forEach((file, index) => {
      const prefix = normalizedType === 'cover' && index === 0 ? 'cover' : `gallery-${Date.now()}-${index + 1}`;
      copiedImagePaths.push(copyUploadedFile(file, productId, prefix));
    });

    const imageHeaders = [...store.images.headers];
    const productHeaders = [...store.products.headers];
    const currentImageRows = store.images.rows.filter((row) => productIdOf(row) === productId);
    const otherImageRows = store.images.rows.filter((row) => productIdOf(row) !== productId);
    const maxGalleryIndex = currentImageRows.reduce((max, row) => {
      const type = valueOf(row, ['image_type']);
      return type.startsWith('gallery') ? Math.max(max, getImageSortNumber(type)) : max;
    }, 0);
    const productName = valueOf(product, ['product_name', 'name', 'title', 'ten_san_pham']);
    const nextImageRows = [...otherImageRows];
    const retainedProductRows =
      normalizedType === 'cover'
        ? currentImageRows.filter((row) => valueOf(row, ['image_type']) !== 'cover')
        : currentImageRows;

    nextImageRows.push(...retainedProductRows);
    copiedImagePaths.forEach((localPath, index) => {
      const row = {};
      setValue(row, imageHeaders, ['product_id'], productId);
      setValue(row, imageHeaders, ['product_name'], productName);
      setValue(row, imageHeaders, ['image_type'], normalizedType === 'cover' && index === 0 ? 'cover' : `gallery_${maxGalleryIndex + index + 1}`);
      setValue(row, imageHeaders, ['option_name'], optionName || '');
      setValue(row, imageHeaders, ['image_url'], '');
      setValue(row, imageHeaders, ['local_image_path'], localPath);
      nextImageRows.push(row);
    });

    const galleryPaths = nextImageRows
      .filter((row) => productIdOf(row) === productId && valueOf(row, ['image_type']).startsWith('gallery'))
      .sort((a, b) => getImageSortNumber(valueOf(a, ['image_type'])) - getImageSortNumber(valueOf(b, ['image_type'])))
      .map((row) => valueOf(row, ['local_image_path']))
      .filter(Boolean);
    const coverPath =
      normalizedType === 'cover'
        ? copiedImagePaths[0]
        : currentImageRows.find((row) => valueOf(row, ['image_type']) === 'cover')?.local_image_path || valueOf(product, ['cover_image']);
    const productRows = store.products.rows.map((row) => {
      if (productIdOf(row) !== productId) return row;
      const next = { ...row };
      if (coverPath) setValue(next, productHeaders, ['cover_image'], coverPath);
      setValue(next, productHeaders, ['gallery_images'], galleryPaths.join('|'));
      return next;
    });

    writeCsvFile(IMAGE_FILE, imageHeaders, nextImageRows);
    writeCsvFile(PRODUCT_FILE, productHeaders, productRows);
    return { ok: true, productId, localPaths: copiedImagePaths, backups };
  } catch (error) {
    removePublicImages(copiedImagePaths);
    return { ok: false, status: 500, errors: [error.message || 'Không thêm được ảnh.'] };
  }
};

export const listBackups = () => {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  const groups = new Map();
  for (const fileName of fs.readdirSync(BACKUP_DIR)) {
    if (fileName === '.gitkeep' || fileName === '.DS_Store') continue;
    const match = fileName.match(/^(\d{4}-\d{2}-\d{2}-\d{6})-(shopee_(?:products|variants|images)_.*\.csv)$/);
    if (!match) continue;
    const [, stamp, csvName] = match;
    const group = groups.get(stamp) ?? { stamp, files: [] };
    group.files.push(csvName);
    groups.set(stamp, group);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, complete: CSV_FILES.every((fileName) => group.files.includes(fileName)) }))
    .sort((a, b) => b.stamp.localeCompare(a.stamp));
};

export const restoreBackup = (stamp) => {
  if (!/^\d{4}-\d{2}-\d{2}-\d{6}$/.test(stamp)) {
    return { ok: false, status: 400, errors: ['Mốc backup không hợp lệ.'] };
  }

  const missing = CSV_FILES.filter((fileName) => !fs.existsSync(path.join(BACKUP_DIR, `${stamp}-${fileName}`)));
  if (missing.length) {
    return { ok: false, status: 404, errors: [`Backup thiếu file: ${missing.join(', ')}`] };
  }

  const safetyBackups = createBackups();
  for (const fileName of CSV_FILES) {
    fs.copyFileSync(path.join(BACKUP_DIR, `${stamp}-${fileName}`), path.join(ROOT, fileName));
  }

  return { ok: true, restoredStamp: stamp, safetyBackups };
};

const findDuplicateSkus = (store, currentProductId, skus) => {
  const requested = skus.map((sku) => String(sku ?? '').trim()).filter(Boolean);
  const duplicates = requested.filter((sku, index) => requested.indexOf(sku) !== index);
  const existing = new Set(
    store.variants.rows
      .filter((row) => productIdOf(row) !== currentProductId)
      .map(variantSkuOf)
      .filter(Boolean),
  );
  return [...new Set([...duplicates, ...requested.filter((sku) => existing.has(sku))])];
};

export const fixVariantSkus = () => {
  const store = readStore();
  const headers = [...store.variants.headers];
  const skuHeader = variantSkuHeader(headers);
  if (!headers.includes(skuHeader)) headers.push(skuHeader);

  const originalSkus = store.variants.rows.map((row) => variantSkuOf(row).trim());
  const originalSkuCounts = originalSkus.reduce((counts, sku) => {
    if (!sku) return counts;
    counts.set(sku, (counts.get(sku) ?? 0) + 1);
    return counts;
  }, new Map());
  const reservedOriginalSkus = new Set(originalSkus.filter(Boolean));
  const productVariantIndexes = getProductVariantIndexes(store.variants.rows);
  const usedFinalSkus = new Set();
  let missingCreated = 0;
  let duplicateFixed = 0;
  const changes = [];

  const rows = store.variants.rows.map((row, index) => {
    const next = { ...row };
    const rawSku = originalSkus[index];
    const productId = productIdOf(row) || 'MEMO';
    let nextSku = rawSku;
    let reason = '';

    if (!rawSku) {
      nextSku = makeUniqueSku(makeVariantSku(productId, productVariantIndexes[index]), new Set([...reservedOriginalSkus, ...usedFinalSkus]));
      missingCreated += 1;
      reason = 'missing';
    } else if (usedFinalSkus.has(rawSku)) {
      nextSku = makeUniqueSku(rawSku, new Set([...reservedOriginalSkus, ...usedFinalSkus]));
      duplicateFixed += 1;
      reason = 'duplicate';
    }

    next[skuHeader] = nextSku;
    usedFinalSkus.add(nextSku);

    if (reason) {
      changes.push({
        row: index + 2,
        product_id: productId,
        variation_id: valueOf(row, ['variation_id', 'variant_id', 'model_id', 'id']),
        from: rawSku,
        to: nextSku,
        reason,
      });
    }

    return next;
  });

  const backups = createBackups();
  if (changes.length) writeCsvFile(VARIANT_FILE, headers, rows);

  return {
    changed: changes.length,
    missingCreated,
    duplicateFixed,
    duplicateSkuGroupsBefore: [...originalSkuCounts.entries()].filter(([, count]) => count > 1).length,
    backups,
    changes,
  };
};

const ignoredUnusedImageFiles = new Set(['.gitkeep', '.DS_Store']);

const listPublicImageFiles = (dir = PRODUCT_IMAGE_ROOT) => {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return listPublicImageFiles(absolute);
    if (!entry.isFile() || ignoredUnusedImageFiles.has(entry.name)) return [];
    return `/${path.relative(path.join(ROOT, 'public'), absolute).replace(/\\/g, '/')}`;
  });
};

export const buildCheckReport = () => {
  const store = readStore();
  const productIds = new Set(store.products.rows.map(productIdOf).filter(Boolean));
  const variantProductIds = new Set(store.variants.rows.map(productIdOf).filter(Boolean));
  const imageProductIds = new Set(store.images.rows.map(productIdOf).filter(Boolean));
  const imagePaths = new Set(store.images.rows.map((row) => valueOf(row, ['local_image_path'])).filter(Boolean));
  const allFiles = listPublicImageFiles();

  const imagesByProduct = new Map();
  for (const image of store.images.rows) {
    const id = productIdOf(image);
    if (!id) continue;
    const list = imagesByProduct.get(id) ?? [];
    list.push(image);
    imagesByProduct.set(id, list);
  }

  const variantSkus = store.variants.rows.map(variantSkuOf).filter(Boolean);
  const duplicateSkus = [...new Set(variantSkus.filter((sku, index) => variantSkus.indexOf(sku) !== index))];
  const missingImageProducts = store.products.rows
    .map((row) => ({ product_id: productIdOf(row), product_name: valueOf(row, ['product_name', 'name', 'title']) }))
    .filter((product) => product.product_id && !(imagesByProduct.get(product.product_id)?.length > 0));
  const variantMissingPrice = store.variants.rows
    .filter((row) => parseNumber(valueOf(row, ['price_vnd', 'price', 'gia'])) <= 0)
    .map((row) => ({ product_id: productIdOf(row), variation_id: valueOf(row, ['variation_id']), variation_name: valueOf(row, ['variation_name']) }));
  const variantMissingSku = store.variants.rows
    .filter((row) => !variantSkuOf(row))
    .map((row) => ({ product_id: productIdOf(row), variation_id: valueOf(row, ['variation_id']), variation_name: valueOf(row, ['variation_name']) }));
  const variantMissingStock = store.variants.rows
    .filter((row) => !valueOf(row, ['stock', 'quantity', 'ton_kho', 'normal_stock']).trim())
    .map((row) => ({ product_id: productIdOf(row), variation_id: valueOf(row, ['variation_id']), variation_name: valueOf(row, ['variation_name']) }));
  const variantOutOfStock = store.variants.rows
    .filter((row) => valueOf(row, ['stock', 'quantity', 'ton_kho', 'normal_stock']).trim() && parseInteger(valueOf(row, ['stock', 'quantity', 'ton_kho', 'normal_stock'])) === 0)
    .map((row) => ({ product_id: productIdOf(row), variation_id: valueOf(row, ['variation_id']), variation_name: valueOf(row, ['variation_name']), sku: variantSkuOf(row) }));
  const imagesMissingFile = store.images.rows
    .map((row) => ({ product_id: productIdOf(row), local_image_path: valueOf(row, ['local_image_path']) }))
    .filter((image) => image.local_image_path && !publicImageExists(image.local_image_path));
  const invalidImagePaths = store.images.rows
    .map((row) => ({ product_id: productIdOf(row), local_image_path: valueOf(row, ['local_image_path']) }))
    .filter((image) => image.local_image_path && !image.local_image_path.startsWith('/images/products/'));
  const unusedFiles = allFiles.filter((file) => !imagePaths.has(file));
  const orphanVariants = [...variantProductIds].filter((id) => !productIds.has(id));
  const orphanImages = [...imageProductIds].filter((id) => !productIds.has(id));
  const productWithoutVariant = [...productIds].filter((id) => !variantProductIds.has(id));
  const rawCategoryConflicts = store.products.rows
    .map((row) => {
      const raw = valueOf(row, ['category_shopee', 'category', 'category_name', 'danh_muc']);
      const expected = CATEGORY_OPTIONS.find((category) => normalizeLookup(raw).includes(normalizeLookup(category)));
      const mapped = categoryOfProduct(row);
      return { product_id: productIdOf(row), product_name: valueOf(row, ['product_name', 'name', 'title']), raw_category: raw, mapped_category: mapped, expected };
    })
    .filter((item) => item.expected && item.expected !== item.mapped);

  return {
    totals: {
      products: store.products.rows.length,
      variants: store.variants.rows.length,
      images: store.images.rows.length,
      physical_image_files: allFiles.length,
    },
    missingImageProducts,
    variantMissingPrice,
    variantMissingSku,
    variantMissingStock,
    variantOutOfStock,
    imagesMissingFile,
    invalidImagePaths,
    unusedFiles,
    duplicateSkus,
    orphanVariants,
    orphanImages,
    productWithoutVariant,
    rawCategoryConflicts,
  };
};

export const formatCheckReport = (report) => {
  const lines = [];
  const section = (title, items, formatter = JSON.stringify) => {
    lines.push(`\n${title}: ${items.length}`);
    items.slice(0, 30).forEach((item) => lines.push(`- ${formatter(item)}`));
    if (items.length > 30) lines.push(`... và ${items.length - 30} dòng khác`);
  };

  lines.push('MEMOLACES product data check');
  lines.push(`- Tổng số sản phẩm: ${report.totals.products}`);
  lines.push(`- Tổng số variants: ${report.totals.variants}`);
  lines.push(`- Tổng số ảnh trong CSV: ${report.totals.images}`);
  lines.push(`- Tổng số file ảnh vật lý: ${report.totals.physical_image_files}`);

  section('Sản phẩm thiếu ảnh', report.missingImageProducts, (item) => `${item.product_id} - ${item.product_name}`);
  section('Variant thiếu SKU', report.variantMissingSku, (item) => `${item.product_id} / ${item.variation_id} / ${item.variation_name}`);
  section('SKU trùng', report.duplicateSkus, (item) => item);
  section('Variant thiếu giá', report.variantMissingPrice, (item) => `${item.product_id} / ${item.variation_id} / ${item.variation_name}`);
  section('Variant thiếu tồn kho', report.variantMissingStock, (item) => `${item.product_id} / ${item.variation_id} / ${item.variation_name}`);
  section('Variant tồn kho 0', report.variantOutOfStock, (item) => `${item.product_id} / ${item.sku} / ${item.variation_name}`);
  section('Ảnh trong CSV nhưng file không tồn tại', report.imagesMissingFile, (item) => `${item.product_id} - ${item.local_image_path}`);
  section('File ảnh tồn tại nhưng không được dùng trong CSV', report.unusedFiles, (item) => item);

  const deployIssues =
    report.missingImageProducts.length +
    report.variantMissingSku.length +
    report.duplicateSkus.length +
    report.variantMissingPrice.length +
    report.variantMissingStock.length +
    report.imagesMissingFile.length;

  if (deployIssues === 0) {
    lines.push('\nDữ liệu sản phẩm đã sẵn sàng để deploy.');
  }

  return lines.join('\n');
};
