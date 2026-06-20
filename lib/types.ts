export type ProductImage = {
  url: string;
  sku?: string;
  sortOrder: number;
};

export type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  option1Name?: string;
  option1Value?: string;
  option2Name?: string;
  option2Value?: string;
};

export type Product = {
  id: string;
  itemId?: string;
  name: string;
  description: string;
  images: string[];
  coverImage: string;
  variants: ProductVariant[];
  minPrice: number;
  maxPrice: number;
  stock: number;
  category: string;
  sku: string;
  isMissingImage: boolean;
};

export type DataReport = {
  productRows: number;
  variantRows: number;
  imageRows: number;
  missingImageProductIds: string[];
  missingFiles: string[];
};

export type CatalogData = {
  products: Product[];
  categories: string[];
  report: DataReport;
};

export type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  name?: string;
  variantName: string;
  sku: string;
  image: string;
  price: number;
  stock: number;
  quantity: number;
};

export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
