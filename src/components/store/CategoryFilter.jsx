'use client';
import { useState } from 'react';

export default function CategoryFilter({ cats }) {
  const [active, setActive] = useState(null);

  const scrollTo = (slug) => {
    const el = document.getElementById(`cat-${slug}`);
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {cats.map(c => (
        <button
          key={c.id}
          onClick={() => { setActive(c.id); scrollTo(c.slug); }}
<<<<<<< HEAD
=======
          className="cat-chip px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
>>>>>>> a3a7d63792529c0b9cfdcc4a247156dad8e387e7
          style={active === c.id ? {
            background: '#1d6fff',
            borderColor: '#1d6fff',
            color: '#fff',
          } : {
<<<<<<< HEAD
            background: 'transparent',
            borderColor: '#0e2445',
            color: '#60a5fa',
          }}
          className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap"
=======
            background: 'var(--card-bg)',
            borderColor: 'var(--border)',
            color: 'var(--accent-light)',
          }}
>>>>>>> a3a7d63792529c0b9cfdcc4a247156dad8e387e7
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
