'use client';
import { useState } from 'react';

const fmt = n => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(n);

const mask = name => {
  if (!name || name.length <= 1) return '***';
  return name[0] + '***';
};

const rankEmoji = ['🥇','🥈','🥉'];
const periods = [
  { key:'daily',   label:'SULTAN HARI INI',    sub:'Periode Hari' },
  { key:'weekly',  label:'SULTAN MINGGU INI',  sub:'Periode Minggu' },
  { key:'monthly', label:'SULTAN BULAN INI',   sub:'Periode Bulan' },
];

function Board({ data, sub }) {
  if (!data || data.length === 0) return (
    <div className="text-center py-8" style={{color:'#3d5a7a'}}>
      <p className="text-3xl mb-2">🏆</p>
      <p className="text-sm">Belum ada data</p>
    </div>
  );

  const top = data[0];
  return (
    <div>
      <p className="text-center text-sm font-semibold text-white mb-4">{sub}</p>
      {/* Top 1 spotlight */}
      <div className="rounded-2xl p-4 mb-4 flex items-center gap-3"
        style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.25)'}}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{background:'rgba(245,158,11,0.15)', border:'2px solid rgba(245,158,11,0.4)'}}>
          🥇
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white">{mask(top.name)}</p>
          <p className="text-xs" style={{color:'rgba(245,158,11,0.7)'}}>TOP #1</p>
        </div>
        <p className="font-black text-lg flex-shrink-0" style={{color:'#f59e0b'}}>{fmt(top.total)}</p>
      </div>
      {/* Rank 2-10 */}
      <div className="flex flex-col gap-2">
        {data.slice(1).map((u, i) => (
          <div key={u.id} className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{background:'#091828', border:'1px solid #0e2445'}}>
            <div className="w-8 text-center flex-shrink-0">
              {i < 2
                ? <span className="text-lg">{rankEmoji[i+1]}</span>
                : <span className="font-bold text-sm" style={{color:'#3d5a7a'}}>#{i+2}</span>
              }
            </div>
            <p className="flex-1 font-semibold text-sm text-white min-w-0 truncate">{mask(u.name)}</p>
            <p className="font-bold text-sm flex-shrink-0" style={{color:'#60a5fa'}}>{fmt(u.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeaderboardClient({ daily, weekly, monthly }) {
  const [active, setActive] = useState('daily');
  const dataMap = { daily, weekly, monthly };

  return (
    <div className="px-4 pb-24 pt-4 max-w-xl mx-auto">
      <h1 className="font-black text-xl text-white mb-1 tracking-wide">🏆 LEADERBOARD</h1>
      <p className="text-xs mb-5" style={{color:'#7bafd4'}}>Top 10 pembeli terbanyak</p>

      {/* Tier info */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label:'MEMBER',   min:'< Rp1jt',   color:'#60a5fa', border:'rgba(96,165,250,0.3)' },
          { label:'GOLD',     min:'≥ Rp1jt',   color:'#fbbf24', border:'rgba(251,191,36,0.3)' },
          { label:'PLATINUM', min:'≥ Rp5jt',   color:'#e2e8f0', border:'rgba(226,232,240,0.3)' },
        ].map(t => (
          <div key={t.label} className="rounded-xl p-2.5 text-center" style={{border:`1px solid ${t.border}`, background:'rgba(0,0,0,0.2)'}}>
            <p className="font-black text-xs" style={{color:t.color}}>{t.label}</p>
            <p className="text-xs mt-0.5" style={{color:'#7bafd4'}}>{t.min}</p>
          </div>
        ))}
      </div>

      {/* Period tabs */}
      {periods.map(p => (
        <div key={p.key} className="mb-5">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{border:'1px solid rgba(245,158,11,0.4)', background:'rgba(245,158,11,0.06)'}}>
              <span className="text-xs font-black tracking-wider" style={{color:'#f59e0b'}}>{p.label}</span>
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{background:'#091828', border:'1px solid #0e2445'}}>
            <Board data={dataMap[p.key]} sub={p.sub} />
          </div>
        </div>
      ))}
    </div>
  );
}
