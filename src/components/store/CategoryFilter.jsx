'use client';
import { useState, useRef } from 'react';

export default function CategoryFilter({ cats }) {
  const [active, setActive] = useState(null);
  const scrollRef = useRef(null);

  // Filter show/hide sections, NO auto-scroll
  const handleClick = (catId) => {
    const next = active === catId ? null : catId;
    setActive(next);
    cats.forEach(c => {
      const el = document.getElementById('cat-' + c.slug);
      if (!el) return;
      el.style.display = (next === null || next === c.id) ? '' : 'none';
    });
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 120, behavior: 'smooth' });
  };

  const navBtn = (icon, dir) => (
    <button
      onClick={() => scroll(dir)}
      style={{
        flexShrink: 0,
        width: '30px', height: '30px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(29,111,255,0.2)',
        border: '1px solid rgba(29,111,255,0.4)',
        borderRadius: '6px',
        color: '#93c5fd', fontSize: '11px', cursor: 'pointer',
        fontWeight: 700,
      }}
    >
      {icon}
    </button>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {/* Prev button — fixed left */}
      {navBtn('◄', -1)}

      {/* Scrollable chips row */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style>{'div::-webkit-scrollbar{display:none}'}</style>
        {cats.map(c => (
          <button
            key={c.id}
            onClick={() => handleClick(c.id)}
            style={{
              flexShrink: 0,
              padding: '5px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              border: '1px solid rgba(29,111,255,0.5)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s',
              // DEFAULT = blue solid, ACTIVE (clicked) = transparent/outline
              background: active === c.id ? 'transparent' : '#1d6fff',
              color: active === c.id ? '#60a5fa' : '#fff',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Next button — fixed right */}
      {navBtn('►', 1)}
    </div>
  );
}