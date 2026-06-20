'use client';

import { useEffect, useMemo, useState } from 'react';

export function ProductGallery({ images, selectedImage, productName }: { images: string[]; selectedImage?: string; productName: string }) {
  const normalizedImages = useMemo(() => (images.length ? images : ['/images/placeholder-product.svg']), [images]);
  const [active, setActive] = useState(selectedImage || normalizedImages[0]);

  useEffect(() => {
    if (selectedImage) setActive(selectedImage);
  }, [selectedImage]);

  return (
    <div className="grid gap-3 lg:sticky lg:top-28">
      <div className="aspect-square overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <img src={active} alt={productName} title={productName} className="h-full w-full object-cover" />
      </div>
      {normalizedImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-7">
          {normalizedImages.map((image, index) => (
            <button
              type="button"
              key={`${image}-${index}`}
              onClick={() => setActive(image)}
              className={`aspect-square overflow-hidden rounded-lg border bg-white shadow-sm transition hover:border-emerald-800 ${active === image ? 'border-emerald-900 ring-2 ring-emerald-900/20' : 'border-stone-200'}`}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <img src={image} alt={productName} title={productName} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
