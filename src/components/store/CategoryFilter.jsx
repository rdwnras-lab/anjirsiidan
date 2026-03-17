'use client';
import { useState, useEffect } from 'react';

export default function CategoryFilter({ cats }) {
  const [active, setActive] = useState(null);

  // Saat active berubah, sembunyikan/tampilkan section kategori
  useEffect(() => {
    cats.forEach(c => {
      const el = document.getElementById(`cat-${c.slug}`);
      if (!el) return;
      if (active === null || active === c.id) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  }, [active, cats]);

  const handleClick = (cat) => {
    if (active === cat.id) {
      // Klik lagi = reset, tampilkan semua
      setActive(null);
    } else {
      setActive(cat.id);
      // Scroll ke section
      setTimeout(() => {
        const el = document.getElementById(`cat-${cat.slug}`);
        if (el) {
          const offset = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {cats.map(c => (
        <button
          key={c.id}
          onClick={() => handleClick(c)}
          className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap"
          style={active === c.id ? {
            background: '#1d6fff',
            borderColor: '#1d6fff',
            color: '#fff',
          } : {
            background: 'transparent',
            borderColor: '#0e2445',
            color: '#60a5fa',
          }}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
