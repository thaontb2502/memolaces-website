import fs from 'node:fs';
import path from 'node:path';
import type { CatalogData, DataReport, Product, ProductImage, ProductVariant } from './types';

const ROOT = process.cwd();
const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

type CsvRow = Record<string, string>;
type CsvReadResult = {
  exists: boolean;
  headers: string[];
  rows: CsvRow[];
};

const PRODUCT_FILE = 'shopee_products_for_website.csv';
const VARIANT_FILE = 'shopee_variants_for_website.csv';
const IMAGE_FILE = 'shopee_images_local.csv';

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^\uFEFF/, '')
    .replace(/[\s-]+/g, '_');

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const parseCsv = (content: string): { headers: string[]; rows: CsvRow[] } => {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
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

  const nonEmptyRows = rows.filter((cells) => cells.some((cell) => cell.trim()));
  const headers = nonEmptyRows[0]?.map(normalizeHeader) ?? [];

  return {
    headers,
    rows: nonEmptyRows.slice(1).map((cells) =>
      headers.reduce<CsvRow>((record, header, index) => {
        record[header] = (cells[index] ?? '').trim();
        return record;
      }, {}),
    ),
  };
};

const readCsv = (fileName: string): CsvReadResult => {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) {
    return { exists: false, headers: [], rows: [] };
  }

  const parsed = parseCsv(fs.readFileSync(filePath, 'utf8'));

  return {
    exists: true,
    ...parsed,
  };
};

const valueOf = (row: CsvRow, aliases: string[]) => {
  for (const alias of aliases) {
    const value = row[normalizeHeader(alias)];
    if (value) return value;
  }

  return '';
};

const productKey = (row: CsvRow, fallback = '') =>
  valueOf(row, ['product_id', 'item_id', 'id', 'product id', 'item id']) || fallback;

const parseNumber = (value: string) => {
  const raw = value.trim();
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

const parseInteger = (value: string) => Math.max(0, Math.floor(parseNumber(value)));

const cleanDescription = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/https?:\/\/cf\.shopee\.vn\/\S+/gi, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const toLocalImagePath = (value: string) => {
  const raw = value.trim();
  if (!raw || /^https?:\/\//i.test(raw) || raw.includes('cf.shopee.vn')) return '';
  const withoutPublic = raw.replace(/^\/?public\//, '');
  const normalized = withoutPublic.startsWith('/') ? withoutPublic : `/${withoutPublic}`;
  return normalized.replace(/\\/g, '/');
};

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const normalizeLookup = (value: string) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const variantOptionKey = (value: string) => normalizeLookup(value.split(',')[0] ?? value);

const brandCategoryFrom = (rawCategory: string, name: string) => {
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

const inferCategory = (row: CsvRow, name: string) => {
  const csvCategory = valueOf(row, ['category', 'category_name', 'category_shopee', 'collection', 'nganh_hang', 'danh_muc']);
  return brandCategoryFrom(csvCategory, name);
};

const inferLengths = (name: string, variants: ProductVariant[]) =>
  unique(
    [name, ...variants.flatMap((variant) => [variant.name, variant.sku])]
      .join(' ')
      .match(/\b(100|120|140|160|180)cm\b/gi)
      ?.map((value) => value.toLowerCase()) ?? [],
  ).sort((a, b) => parseInteger(a) - parseInteger(b));

const inferStyleTags = (name: string, description: string, variants: ProductVariant[]) => {
  const lookup = normalizeLookup([name, description, ...variants.flatMap((variant) => [variant.name, variant.sku])].join(' '));
  const tags: string[] = [];
  const addTag = (label: string, patterns: string[]) => {
    if (patterns.some((pattern) => new RegExp(`\\b${pattern}\\b`).test(lookup))) tags.push(label);
  };

  addTag('flat', ['flat', 'det', 'day flat']);
  addTag('oval', ['oval']);
  addTag('rope', ['rope', 'tron', 'day tron']);
  addTag('reflective', ['reflective', 'phan quang', 'da quang']);
  addTag('waxed', ['waxed', 'sap']);
  addTag('printed', ['printed', 'print', 'custom', 'in chu']);
  addTag('shoelaces', ['shoelaces', 'shoe laces', 'offwhite']);
  addTag('jordan', ['jordan', 'aj1', 'aj 1', 'air jordan']);
  addTag('dunk', ['dunk', 'sb']);
  addTag('yeezy', ['yeezy', '350']);
  addTag('air-max', ['air max']);
  addTag('mlb', ['mlb']);
  addTag('converse-vans', ['converse', 'vans', '1970']);

  return unique(tags);
};

const variantName = (row: CsvRow) => {
  const explicit = valueOf(row, ['variant_name', 'model_name', 'variation_name', 'ten_phan_loai']);
  const option1 = valueOf(row, ['option1_value', 'option_1_value', 'phan_loai_1', 'variation_1']);
  const option2 = valueOf(row, ['option2_value', 'option_2_value', 'phan_loai_2', 'variation_2']);
  return explicit || [option1, option2].filter(Boolean).join(' / ') || 'Mặc định';
};

const variantPrice = (row: CsvRow) =>
  parseNumber(
    valueOf(row, [
      'price_vnd',
      'price',
      'price_min_vnd',
      'price_max_vnd',
      'min_price',
      'max_price',
      'current_price',
      'sale_price',
      'gia',
      'gia_ban',
    ]),
  );

const productPrice = (row: CsvRow) =>
  parseNumber(
    valueOf(row, [
      'price_vnd',
      'price',
      'price_min_vnd',
      'price_max_vnd',
      'min_price',
      'max_price',
      'current_price',
      'sale_price',
      'gia',
      'gia_ban',
    ]),
  );

const logCatalogDebug = ({
  productsCsv,
  variantsCsv,
  imagesCsv,
  products,
}: {
  productsCsv: CsvReadResult;
  variantsCsv: CsvReadResult;
  imagesCsv: CsvReadResult;
  products: Product[];
}) => {
  const debugGlobal = globalThis as typeof globalThis & { __shopeeCsvCatalogDebugLogged?: boolean };
  if (debugGlobal.__shopeeCsvCatalogDebugLogged) return;
  debugGlobal.__shopeeCsvCatalogDebugLogged = true;

  const testProduct = products.find((product) => product.id === '2978367574');
  const variantsWithPrice = products.flatMap((product) => product.variants).filter((variant) => variant.price > 0).length;

  const debugPayload = {
    productRows: productsCsv.rows.length,
    variantRows: variantsCsv.rows.length,
    imageRows: imagesCsv.rows.length,
    variantsWithPrice,
    headers: {
      products: productsCsv.headers,
      variants: variantsCsv.headers,
      images: imagesCsv.headers,
    },
    product2978367574: testProduct
      ? {
          minPrice: testProduct.minPrice,
          maxPrice: testProduct.maxPrice,
          firstVariants: testProduct.variants.slice(0, 3).map((variant) => ({
            variantName: variant.name,
            SKU: variant.sku,
            price: variant.price,
            stock: variant.stock,
          })),
        }
      : null,
  };

  console.info('[catalog-debug]', JSON.stringify(debugPayload, null, 2));
};

const buildCatalog = (): CatalogData => {
  const productsCsv = readCsv(PRODUCT_FILE);
  const variantsCsv = readCsv(VARIANT_FILE);
  const imagesCsv = readCsv(IMAGE_FILE);
  const missingFiles = [
    !productsCsv.exists ? PRODUCT_FILE : '',
    !variantsCsv.exists ? VARIANT_FILE : '',
    !imagesCsv.exists ? IMAGE_FILE : '',
  ].filter(Boolean);

  const imagesByProduct = new Map<string, ProductImage[]>();
  const imagesByProductSku = new Map<string, string>();
  const imagesByProductOption = new Map<string, string>();
  const imagesByProductSourceUrl = new Map<string, string>();

  imagesCsv.rows.forEach((row, index) => {
    const id = productKey(row);
    const sku = valueOf(row, ['sku', 'SKU', 'model_sku', 'seller_sku', 'variation_sku', 'parent_sku']);
    const optionName = valueOf(row, ['option_name', 'variation_name', 'variant_name']);
    const sourceUrl = valueOf(row, ['image_url']);
    const localPath = toLocalImagePath(valueOf(row, ['local_image_path']));
    if (!id || !localPath) return;

    const image: ProductImage = {
      url: localPath,
      sku,
      sortOrder: parseInteger(valueOf(row, ['sort_order', 'position', 'image_index', 'index'])) || index,
    };

    const list = imagesByProduct.get(id) ?? [];
    list.push(image);
    imagesByProduct.set(id, list);

    if (sku) imagesByProductSku.set(`${id}::${sku}`, localPath);
    if (optionName) imagesByProductOption.set(`${id}::${normalizeLookup(optionName)}`, localPath);
    if (sourceUrl) imagesByProductSourceUrl.set(`${id}::${sourceUrl}`, localPath);
  });

  const variantsByProduct = new Map<string, ProductVariant[]>();

  variantsCsv.rows.forEach((row, index) => {
    const id = productKey(row);
    if (!id) return;

    const sku = valueOf(row, ['sku', 'SKU', 'model_sku', 'seller_sku', 'variation_sku', 'parent_sku']) || `${id}-${index + 1}`;
    const option1Value = valueOf(row, ['option1_value', 'option_1_value', 'phan_loai_1', 'variation_1']);
    const option2Value = valueOf(row, ['option2_value', 'option_2_value', 'phan_loai_2', 'variation_2']);
    const name = variantName(row);
    const imageFromVariant = toLocalImagePath(valueOf(row, ['local_image_path']));
    const imageFromSourceUrl = imagesByProductSourceUrl.get(`${id}::${valueOf(row, ['variation_image', 'image_url'])}`);
    const imageFromOption = imagesByProductOption.get(`${id}::${variantOptionKey(name)}`);
    const imageFromCsv = imagesByProductSku.get(`${id}::${sku}`);

    const variant: ProductVariant = {
      id: valueOf(row, ['variant_id', 'variation_id', 'model_id', 'id']) || `${id}-${sku}-${index}`,
      productId: id,
      name,
      sku,
      price: variantPrice(row),
      stock: parseInteger(valueOf(row, ['stock', 'quantity', 'ton_kho', 'normal_stock'])),
      image: imageFromVariant || imageFromSourceUrl || imageFromOption || imageFromCsv || undefined,
      option1Name: valueOf(row, ['option1_name', 'option_1_name', 'ten_phan_loai_1']),
      option1Value,
      option2Name: valueOf(row, ['option2_name', 'option_2_name', 'ten_phan_loai_2']),
      option2Value,
    };

    const list = variantsByProduct.get(id) ?? [];
    list.push(variant);
    variantsByProduct.set(id, list);
  });

  const products = productsCsv.rows.map<Product>((row, index) => {
    const id = productKey(row, `product-${index + 1}`);
    const name = valueOf(row, ['name', 'product_name', 'title', 'ten_san_pham']) || `Sản phẩm ${index + 1}`;
    const productImages = (imagesByProduct.get(id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.url);
    const variants = variantsByProduct.get(id) ?? [];
    const productSku = valueOf(row, ['sku', 'SKU', 'seller_sku', 'parent_sku']);
    const fallbackProductPrice = productPrice(row);
    const productStock = parseInteger(valueOf(row, ['stock', 'total_stock', 'quantity', 'ton_kho', 'normal_stock']));

    const normalizedVariants =
      variants.length > 0
        ? variants
        : [
            {
              id: `${id}-default`,
              productId: id,
              name: 'Mặc định',
              sku: productSku || id,
              price: fallbackProductPrice,
              stock: productStock,
            },
          ];

    const description =
      cleanDescription(valueOf(row, ['description', 'product_description', 'mo_ta'])) ||
      'Sản phẩm đang được cập nhật mô tả.';
    const images = unique([
      ...productImages,
      ...normalizedVariants.map((variant) => variant.image).filter(Boolean),
    ] as string[]);
    const prices = normalizedVariants.map((variant) => variant.price).filter((price) => price > 0);

    return {
      id,
      itemId: valueOf(row, ['item_id']),
      name,
      description,
      images,
      coverImage: images[0] || PLACEHOLDER_IMAGE,
      variants: normalizedVariants,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      stock: normalizedVariants.reduce((sum, variant) => sum + variant.stock, 0),
      category: inferCategory(row, name),
      lengths: inferLengths(name, normalizedVariants),
      styleTags: inferStyleTags(name, description, normalizedVariants),
      sku: productSku || normalizedVariants[0]?.sku || id,
      isMissingImage: images.length === 0,
    };
  });

  const report: DataReport = {
    productRows: productsCsv.rows.length,
    variantRows: variantsCsv.rows.length,
    imageRows: imagesCsv.rows.length,
    missingImageProductIds: products.filter((product) => product.isMissingImage).map((product) => product.id),
    missingFiles,
  };

  logCatalogDebug({ productsCsv, variantsCsv, imagesCsv, products });

  return {
    products,
    categories: unique(products.map((product) => product.category)).sort((a, b) => a.localeCompare(b, 'vi')),
    report,
  };
};

export const getCatalog = () => buildCatalog();

export const getProductById = (id: string) =>
  getCatalog().products.find((product) => product.id === decodeURIComponent(id));

export const getRelatedProducts = (product: Product, limit = 4) =>
  getCatalog()
    .products.filter((item) => item.id !== product.id)
    .sort((a, b) => {
      const score = (item: Product) =>
        (item.category === product.category ? 4 : 0) +
        item.styleTags.filter((tag) => product.styleTags.includes(tag)).length * 2 +
        item.lengths.filter((length) => product.lengths.includes(length)).length;
      return score(b) - score(a);
    })
    .slice(0, limit);

export const placeholderImage = PLACEHOLDER_IMAGE;
