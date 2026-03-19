'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const [held, setHeld] = useState(false);
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || '';

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block"
      style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseDown={() => setHeld(true)}
      onMouseUp={() => setHeld(false)}
      onMouseLeave={() => setHeld(false)}
      onTouchStart={() => setHeld(true)}
      onTouchEnd={() => setHeld(false)}
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          border: held ? '2px solid #1d6fff' : '2px solid rgba(29,111,255,0.2)',
          background: '#0a1628',
          boxShadow: held ? '0 0 16px rgba(29,111,255,0.4)' : 'none',
          aspectRatio: '1/1',
        }}
      >
        <div className="w-full h-full relative overflow-hidden">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
              style={{ filter: held ? 'blur(3px) brightness(0.35)' : 'none' }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-4xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(29,111,255,0.15), rgba(13,59,138,0.25))',
                filter: held ? 'blur(3px) brightness(0.35)' : 'none',
              }}
            >
              {product.icon || '📦'}
            </div>
          )}

          {/* Blur overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
            style={{ opacity: held ? 1 : 0 }}
          >
            {/* Logo — top right */}
            {logoUrl && (
              <div className="absolute top-2 right-2">
                <img
                  src={logoUrl}
                  alt="logo"
                  style={{
                    width: '28px',
                    height: '28px',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  }}
                />
              </div>
            )}

            {/* Product name — bottom left */}
            <div
              className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-8"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)',
              }}
            >
              <p
                className="font-black text-white leading-tight line-clamp-2 drop-shadow-lg"
                style={{ fontSize: '0.68rem' }}
              >
                {product.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}