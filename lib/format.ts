export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

export const formatPriceRange = (minPrice: number, maxPrice: number) => {
  if (!minPrice && !maxPrice) return 'Liên hệ';
  if (minPrice === maxPrice) return formatCurrency(minPrice);
  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
};
