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
          border: held ? '2px solid #1d6fff' : '2px solid rgba(29,111,255,0.15)',
          background: '#0a1628',
          boxShadow: held ? '0 0 16px rgba(29,111,255,0.4)' : 'none',
          aspectRatio: '1/1',
          transform: held ? 'scale(0.97)' : 'scale(1)',
        }}
      >
        {/* Full artwork */}
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            style={{ filter: held ? 'brightness(0.55)' : 'none' }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-4xl"
            style={{ background: 'linear-gradient(135deg, rgba(29,111,255,0.15), rgba(13,59,138,0.25))' }}
          >
            {product.icon || '📦'}
          </div>
        )}

        {/* Always-visible gradient + name at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 px-2 pb-2 pt-6"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)' }}
        >
          <p
            className="font-black text-white leading-tight line-clamp-2 drop-shadow-lg"
            style={{ fontSize: '0.7rem', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
          >
            {product.name}
          </p>
        </div>

        {/* Logo top-right on hold */}
        {logoUrl && (
          <div
            className="absolute top-2 right-2 transition-opacity duration-200"
            style={{ opacity: held ? 1 : 0 }}
          >
            <img
              src={logoUrl}
              alt="logo"
              style={{ width:'26px', height:'26px', objectFit:'contain',
                borderRadius:'6px', boxShadow:'0 2px 8px rgba(0,0,0,0.6)' }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}