'use client';
import { useState, useRef, useEffect } from 'react';

export default function CategoryFilter({ cats }) {
  const [activeIdx, setActiveIdx] = useState(null); // null = semua
  const chipRefs = useRef([]);
  const scrollRef = useRef(null);

  const applyFilter = (idx) => {
    setActiveIdx(idx);
    cats.forEach((c, i) => {
      const el = document.getElementById('cat-' + c.slug);
      if (!el) return;
      el.style.display = (idx === null || i === idx) ? '' : 'none';
    });
    // Scroll the active chip into view inside the row
    if (idx !== null && chipRefs.current[idx]) {
      chipRefs.current[idx].scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
    }
  };

  const goPrev = () => {
    if (activeIdx === null) {
      applyFilter(cats.length - 1);
    } else if (activeIdx === 0) {
      applyFilter(null);
    } else {
      applyFilter(activeIdx - 1);
    }
  };

  const goNext = () => {
    if (activeIdx === null) {
      applyFilter(0);
    } else if (activeIdx === cats.length - 1) {
      applyFilter(null);
    } else {
      applyFilter(activeIdx + 1);
    }
  };

  const NavBtn = ({ onClick, children }) => (
    <button onClick={onClick} style={{
      flexShrink:0, width:'28px', height:'28px',
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(29,111,255,0.2)',
      border:'1px solid rgba(29,111,255,0.4)',
      borderRadius:'6px', color:'#93c5fd',
      cursor:'pointer', fontSize:'13px', lineHeight:1,
    }}>
      {children}
    </button>
  );

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
      {/* Prev */}
      <NavBtn onClick={goPrev}>
        {/* chevron-left */}
        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
          <polyline points='15 18 9 12 15 6'/>
        </svg>
      </NavBtn>

      {/* Chip row — swipeable touch only, arrows change active category */}
      <div ref={scrollRef} style={{
        flex:1, display:'flex', gap:'6px',
        overflowX:'auto', scrollbarWidth:'none', msOverflowStyle:'none',
        WebkitOverflowScrolling:'touch',
      }}>
        <style>{'div::-webkit-scrollbar{display:none}'}</style>
        {cats.map((c, i) => (
          <button
            key={c.id}
            ref={el => chipRefs.current[i] = el}
            onClick={() => applyFilter(activeIdx === i ? null : i)}
            style={{
              flexShrink:0,
              padding:'5px 14px',
              borderRadius:'6px',
              fontSize:'11px', fontWeight:700,
              border:'1px solid rgba(29,111,255,0.5)',
              whiteSpace:'nowrap', cursor:'pointer',
              transition:'all 0.15s',
              background: activeIdx === i ? 'transparent' : '#1d6fff',
              color: activeIdx === i ? '#60a5fa' : '#fff',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Next */}
      <NavBtn onClick={goNext}>
        {/* chevron-right */}
        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
          <polyline points='9 18 15 12 9 6'/>
        </svg>
      </NavBtn>
    </div>
  );
}