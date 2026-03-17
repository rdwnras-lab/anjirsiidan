'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const [held, setHeld] = useState(false);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block"
      style={{textDecoration:'none', color:'inherit'}}
      onMouseDown={() => setHeld(true)}
      onMouseUp={() => setHeld(false)}
      onMouseLeave={() => setHeld(false)}
      onTouchStart={() => setHeld(true)}
      onTouchEnd={() => setHeld(false)}
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          border: held ? '2px solid #1d6fff' : '2px solid #1d4ed8',
          background: 'var(--card-bg)',
          boxShadow: held ? '0 0 16px rgba(29,111,255,0.4)' : 'none',
        }}
      >
        {/* Image only — aspect square */}
        <div className="aspect-square relative overflow-hidden bg-surface">
          {product.thumbnail
            ? <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
                style={{filter: held ? 'blur(2px) brightness(0.5)' : 'none'}}
              />
            : <div
                className="w-full h-full flex items-center justify-center text-4xl transition-all duration-300"
                style={{
                  background:'linear-gradient(135deg, rgba(29,111,255,0.1), rgba(13,59,138,0.2))',
                  filter: held ? 'blur(2px) brightness(0.5)' : 'none',
                }}>
                {product.icon || '📦'}
              </div>
          }

          {/* Hold overlay: nama produk + kategori */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center transition-opacity duration-200"
            style={{opacity: held ? 1 : 0, background:'rgba(0,0,0,0.3)'}}>
            <p className="font-black text-white text-xs leading-tight line-clamp-3 drop-shadow-lg">
              {product.name}
            </p>
            {product.category?.name && (
              <p className="text-xs mt-1 font-semibold" style={{color:'#60a5fa'}}>
                {product.category.name}
              </p>
            )}
          </div>
        </div>
        {/* NO bottom card — image only */}
      </div>
    </Link>
  );
}
