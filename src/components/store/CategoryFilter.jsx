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
        <button key={c.id}
          onClick={() => { setActive(c.id); scrollTo(c.slug); }}
          className={`cat-chip flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            active === c.id ? 'cat-chip-active' : ''
          }`}
          style={active === c.id ? {} : {
            background:'var(--card-bg)',
            borderColor:'var(--border)',
            color:'var(--accent-light)',
          }}>
          <span>{c.icon}</span>
          <span>{c.name}</span>
        </button>
      ))}
    </div>
  );
}
