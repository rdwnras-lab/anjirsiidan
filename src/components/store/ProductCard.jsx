'use client';
import Link from 'next/link';
import { useState, useRef, useCallback } from 'react';

export default function ProductCard({ product }) {
  const [held, setHeld] = useState(false);
  const holdTimer  = useRef(null);
  const didHold    = useRef(false);
  const logoUrl    = process.env.NEXT_PUBLIC_LOGO_URL || '';

  const onDown = useCallback(() => {
    didHold.current = false;
    holdTimer.current = setTimeout(() => {
      didHold.current = true;
      setHeld(true);
    }, 300);
  }, []);

  const onUp = useCallback(() => {
    clearTimeout(holdTimer.current);
    setHeld(false);
  }, []);

  return (
    <Link
      href={'/products/' + product.slug}
      className='block select-none'
      style={{ textDecoration:'none', color:'inherit', WebkitTapHighlightColor:'transparent' }}
      onClick={e => { if (didHold.current) e.preventDefault(); }}
      onMouseDown={onDown} onMouseUp={onUp} onMouseLeave={onUp}
      onTouchStart={onDown} onTouchEnd={onUp} onTouchCancel={onUp}
    >
      <div className='relative rounded-2xl overflow-hidden transition-all duration-200'
        style={{
          border: held ? '2px solid #1d6fff' : '2px solid rgba(29,111,255,0.18)',
          background: '#0a1628',
          boxShadow: held ? '0 0 18px rgba(29,111,255,0.45)' : 'none',
          aspectRatio: '3/4',
          transform: held ? 'scale(0.96)' : 'scale(1)',
        }}
      >
        {/* Artwork */}
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name}
            className='absolute inset-0 w-full h-full object-cover transition-all duration-300'
            style={{ filter: held ? 'blur(4px) brightness(0.3)' : 'none' }}
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center text-4xl transition-all duration-300'
            style={{ background:'linear-gradient(135deg,rgba(29,111,255,0.15),rgba(13,59,138,0.25))',
                     filter: held ? 'blur(4px) brightness(0.3)' : 'none' }}>
            📦
          </div>
        )}

        {/* Hold overlay — only visible on hold */}
        <div className='absolute inset-0 pointer-events-none flex flex-col justify-between p-2'
          style={{ opacity: held ? 1 : 0, transition:'opacity 0.2s' }}>
          {/* Logo top-right */}
          {logoUrl && (
            <div className='flex justify-end'>
              <img src={logoUrl} alt='logo'
                style={{ width:'28px', height:'28px', objectFit:'contain',
                  borderRadius:'7px', boxShadow:'0 2px 10px rgba(0,0,0,0.7)' }} />
            </div>
          )}
          {/* Name + publisher — bottom */}
          <div className='rounded-xl px-2 py-1.5' style={{ background:'rgba(0,0,0,0.65)' }}>
            <p className='font-black text-white leading-tight line-clamp-2 drop-shadow-lg'
              style={{ fontSize:'0.72rem' }}>
              {product.name}
            </p>
            {(product.publisher || product.category?.name) && (
              <p style={{ fontSize:'0.62rem', color:'#93c5fd', marginTop:'2px' }}
                className='line-clamp-1'>
                {product.publisher || product.category?.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}