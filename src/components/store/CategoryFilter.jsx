'use client';
import { useState } from 'react';

export default function CategoryFilter({ cats }) {
  const [active, setActive] = useState(null);

  const scrollTo = (slug) => {
    const el = document.getElementById(`cat-${slug}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {cats.map(c => (
        <button
          key={c.id}
          onClick={() => { setActive(c.id); scrollTo(c.slug); }}
          className="cat-chip px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
          style={active === c.id ? {
            background: '#1d6fff',
            borderColor: '#1d6fff',
            color: '#fff',
          } : {
            background: 'var(--card-bg)',
            borderColor: 'var(--border)',
            color: 'var(--accent-light)',
          }}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
