'use client';

const fmt = n => new Intl.NumberFormat('id-ID', {
  style:'currency', currency:'IDR', minimumFractionDigits:0
}).format(n);

const mask = name => {
  if (!name || name.length <= 1) return '***';
  return name[0] + '***';
};

const rankEmoji = ['🥇','🥈','🥉'];

function Board({ data, title, sub }) {
  return (
    <div className="mb-6">
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full"
          style={{border:'1px solid rgba(245,158,11,0.4)', background:'rgba(245,158,11,0.06)'}}>
          <span className="text-xs font-black tracking-wider" style={{color:'#f59e0b'}}>{title}</span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{background:'#091828', border:'1px solid #0e2445'}}>
        {!data || data.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{color:'#3d5a7a'}}>
            Belum ada data {sub.toLowerCase()}
          </div>
        ) : (
          <>
            {/* Top 1 spotlight */}
            <div className="flex items-center gap-3 px-4 py-4"
              style={{background:'rgba(245,158,11,0.06)', borderBottom:'1px solid #0e2445'}}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{background:'rgba(245,158,11,0.15)', border:'2px solid rgba(245,158,11,0.4)'}}>
                🥇
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white">{mask(data[0].name)}</p>
                <p className="text-xs" style={{color:'rgba(245,158,11,0.7)'}}>TOP #1 · {data[0].count} transaksi</p>
              </div>
              <p className="font-black text-lg flex-shrink-0" style={{color:'#f59e0b'}}>{fmt(data[0].total)}</p>
            </div>

            {/* Rank 2-10 */}
            <div className="divide-y" style={{borderColor:'#0e2445'}}>
              {data.slice(1).map((u, i) => (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 text-center flex-shrink-0">
                    {i < 2
                      ? <span className="text-lg">{rankEmoji[i+1]}</span>
                      : <span className="font-bold text-sm" style={{color:'#3d5a7a'}}>#{i+2}</span>
                    }
                  </div>
                  <p className="flex-1 font-semibold text-sm text-white min-w-0 truncate">{mask(u.name)}</p>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm" style={{color:'#60a5fa'}}>{fmt(u.total)}</p>
                    <p className="text-xs" style={{color:'#3d5a7a'}}>{u.count} transaksi</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardClient({ daily, weekly, monthly }) {
  return (
    <div className="px-4 pb-24 pt-4 max-w-xl mx-auto">
      <h1 className="font-black text-xl text-white mb-1 tracking-wide">🏆 LEADERBOARD</h1>
      <p className="text-xs mb-6" style={{color:'#7bafd4'}}>Top 10 pembeli terbanyak</p>

      <Board data={daily}   title="SULTAN HARI INI"   sub="hari ini" />
      <Board data={weekly}  title="SULTAN MINGGU INI" sub="minggu ini" />
      <Board data={monthly} title="SULTAN BULAN INI"  sub="bulan ini" />
    </div>
  );
}
