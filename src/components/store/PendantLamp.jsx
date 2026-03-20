'use client';
import { useState, useEffect } from 'react';

const THEMES = [
  { name:'Biru',   accent:'#1d6fff', light:'#60a5fa', glow:'rgba(29,111,255,0.65)',  bulb:'radial-gradient(circle at 40% 35%, #7bb8ff 0%, #1d6fff 60%, #0a3fa0 100%)', wire:'rgba(29,111,255,0.9)'   },
  { name:'Ungu',   accent:'#9333ea', light:'#c084fc', glow:'rgba(147,51,234,0.65)', bulb:'radial-gradient(circle at 40% 35%, #d8b4fe 0%, #9333ea 60%, #5b21b6 100%)', wire:'rgba(147,51,234,0.9)'  },
  { name:'Hijau',  accent:'#10b981', light:'#6ee7b7', glow:'rgba(16,185,129,0.65)', bulb:'radial-gradient(circle at 40% 35%, #6ee7b7 0%, #10b981 60%, #065f46 100%)', wire:'rgba(16,185,129,0.9)'  },
  { name:'Merah',  accent:'#ef4444', light:'#fca5a5', glow:'rgba(239,68,68,0.65)',  bulb:'radial-gradient(circle at 40% 35%, #fca5a5 0%, #ef4444 60%, #7f1d1d 100%)', wire:'rgba(239,68,68,0.9)'   },
  { name:'Kuning', accent:'#f59e0b', light:'#fde68a', glow:'rgba(245,158,11,0.65)', bulb:'radial-gradient(circle at 40% 35%, #fde68a 0%, #f59e0b 60%, #78350f 100%)', wire:'rgba(245,158,11,0.9)'  },
  { name:'Pink',   accent:'#ec4899', light:'#f9a8d4', glow:'rgba(236,72,153,0.65)', bulb:'radial-gradient(circle at 40% 35%, #f9a8d4 0%, #ec4899 60%, #831843 100%)', wire:'rgba(236,72,153,0.9)'  },
];

export default function PendantLamp() {
  const [idx, setIdx] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [label, setLabel] = useState('');
  const t = THEMES[idx];

  const handleClick = () => {
    const next = (idx + 1) % THEMES.length;
    const nextTheme = THEMES[next];
    setIdx(next);
    setPulse(true);
    setLabel(nextTheme.name);
    // Apply CSS variables globally
    const root = document.documentElement;
    root.style.setProperty('--accent',       nextTheme.accent);
    root.style.setProperty('--accent-light', nextTheme.light);
    root.style.setProperty('--border-bright',nextTheme.accent);
    setTimeout(() => setPulse(false), 500);
    setTimeout(() => setLabel(''), 1400);
  };

  return (
    <div style={{ position:'absolute', bottom:'-52px', right:'48px', zIndex:0, userSelect:'none', display:'flex', flexDirection:'column', alignItems:'center' }}>
      {/* Tema label tooltip */}
      {label && (
        <div style={{
          position:'absolute', bottom:'100%', marginBottom:'6px',
          background:'rgba(0,0,0,0.75)', color:'#fff',
          fontSize:'0.65rem', fontWeight:700, padding:'3px 8px',
          borderRadius:'20px', whiteSpace:'nowrap',
          border:`1px solid ${t.accent}`,
          animation:'fadeUp 0.3s ease',
        }}>
          {label}
        </div>
      )}
      {/* Wire */}
      <div style={{ width:'1.5px', height:'36px', background:`linear-gradient(to bottom, rgba(29,111,255,0.4), ${t.wire})` }} />
      {/* Bulb */}
      <button
        onClick={handleClick}
        title={`Tema: ${t.name} — klik ganti warna`}
        style={{
          width:'18px', height:'22px',
          borderRadius:'50% 50% 48% 48%',
          background: t.bulb,
          border:'none', cursor:'pointer', padding:0,
          position:'relative',
          boxShadow: pulse
            ? `0 0 20px 10px ${t.glow}, 0 0 40px 16px ${t.glow}`
            : `0 0 10px 4px ${t.glow}, 0 0 22px 8px ${t.glow.replace('0.65','0.3')}`,
          transition:'box-shadow 0.3s ease, transform 0.15s ease',
          transform: pulse ? 'scale(1.3)' : 'scale(1)',
        }}
      >
        <div style={{ position:'absolute', top:'4px', left:'5px', width:'5px', height:'5px', borderRadius:'50%', background:'rgba(255,255,255,0.55)', pointerEvents:'none' }} />
      </button>
      {/* Base cap */}
      <div style={{ width:'10px', height:'3px', background: t.wire, borderRadius:'0 0 3px 3px', transition:'background 0.3s' }} />
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(4px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}