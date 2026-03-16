export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';

async function getLeaderboard() {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('user_id, user_name, user_avatar, total_amount, status')
    .eq('status', 'completed');

  if (!data) return [];

  const map = {};
  for (const o of data) {
    if (!o.user_id) continue;
    if (!map[o.user_id]) map[o.user_id] = { user_id: o.user_id, name: o.user_name, avatar: o.user_avatar, total: 0, count: 0 };
    map[o.user_id].total += o.total_amount || 0;
    map[o.user_id].count += 1;
  }

  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 50);
}

const rankEmoji = ['🥇', '🥈', '🥉'];

function formatIDR(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

const tierThreshold = [
  { label: 'PLATINUM', min: 5000000, color: '#e2e8f0', bg: 'rgba(226,232,240,0.1)', border: 'rgba(226,232,240,0.3)' },
  { label: 'GOLD',     min: 1000000, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)' },
  { label: 'MEMBER',   min: 0,       color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)' },
];

function getTier(total) {
  return tierThreshold.find(t => total >= t.min) || tierThreshold[2];
}

export default async function LeaderboardPage() {
  const board = await getLeaderboard();

  return (
    <div className="px-4 pb-24 pt-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="font-black text-2xl text-white">🏆 LEADERBOARD</h1>
        <p className="text-sm mt-1" style={{color:'#60a5fa', opacity:0.7}}>Top spender bulan ini</p>
      </div>

      {/* Tier legend */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {tierThreshold.map(t => (
          <div key={t.label} className="rounded-xl p-3 text-center" style={{border:`1px solid ${t.border}`, background:t.bg}}>
            <p className="font-black text-xs" style={{color:t.color}}>{t.label}</p>
            <p className="text-xs mt-0.5" style={{color:'#7bafd4'}}>
              {t.label === 'PLATINUM' ? '≥ Rp5jt' : t.label === 'GOLD' ? '≥ Rp1jt' : '< Rp1jt'}
            </p>
          </div>
        ))}
      </div>

      {board.length === 0 ? (
        <div className="text-center py-20 text-dim">
          <p className="text-4xl mb-3">🏆</p>
          <p>Belum ada data leaderboard</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {board.map((u, i) => {
            const tier = getTier(u.total);
            return (
              <div key={u.user_id}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  background: i < 3 ? 'rgba(29,111,255,0.08)' : 'var(--card-bg)',
                  border: `1px solid ${i < 3 ? '#1d4ed8' : 'var(--border)'}`,
                }}>
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {i < 3
                    ? <span className="text-xl">{rankEmoji[i]}</span>
                    : <span className="font-bold text-sm" style={{color:'#3d5a7a'}}>#{i+1}</span>
                  }
                </div>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{border:'1px solid #1d4ed8'}}>
                  {u.avatar
                    ? <img src={`https://cdn.discordapp.com/avatars/${u.user_id}/${u.avatar}.png?size=64`} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center font-bold text-sm" style={{background:'rgba(29,111,255,0.15)', color:'#60a5fa'}}>
                        {(u.name || '?')[0].toUpperCase()}
                      </div>
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">{u.name || 'User'}</p>
                  <p className="text-xs mt-0.5" style={{color:'#7bafd4'}}>{u.count} transaksi</p>
                </div>
                {/* Right: tier + amount */}
                <div className="text-right flex-shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold border mb-1"
                    style={{color:tier.color, background:tier.bg, borderColor:tier.border}}>
                    {tier.label}
                  </span>
                  <p className="text-xs font-bold" style={{color:'#60a5fa'}}>{formatIDR(u.total)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
