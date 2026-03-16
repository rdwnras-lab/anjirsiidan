export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { formatIDR, timeAgo } from '@/lib/utils';
import Link from 'next/link';

const statusLabel = {
  pending: 'Menunggu', paid: 'Dibayar',
  processing: 'Diproses', completed: 'Selesai',
  failed: 'Gagal', cancelled: 'Batal',
};
const statusColor = {
  pending: '#f59e0b', paid: '#60a5fa',
  processing: '#a78bfa', completed: '#10b981',
  failed: '#ef4444', cancelled: '#6b7280',
};
const tierInfo = {
  platinum: { color: '#e2e8f0', bg: 'rgba(226,232,240,0.08)', border: 'rgba(226,232,240,0.25)', label: 'PLATINUM', next: null, nextMin: null },
  gold:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  label: 'GOLD',     next: 'PLATINUM', nextMin: 5000000 },
  member:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)',  label: 'MEMBER',   next: 'GOLD',     nextMin: 1000000 },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.discordId) redirect('/login');

  const uid = session.user.discordId;

  const [ordersRes, userRes] = await Promise.all([
    supabaseAdmin.from('orders').select('id, status, total_amount, created_at, product_name, variant_name')
      .eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
    supabaseAdmin.from('users').select('tier, balance, total_spent').eq('id', uid).single(),
  ]);

  const orders = ordersRes.data || [];
  const user   = userRes.data || {};
  const tier   = (user.tier || session.user.tier || 'member').toLowerCase();
  const tInfo  = tierInfo[tier] || tierInfo.member;
  const totalSpent = user.total_spent || orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total_amount, 0);

  const stats = {
    total:   orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    proses:  orders.filter(o => ['paid','processing'].includes(o.status)).length,
    sukses:  orders.filter(o => o.status === 'completed').length,
    gagal:   orders.filter(o => ['failed','cancelled'].includes(o.status)).length,
  };

  const avatarUrl = session.user.avatar
    ? `https://cdn.discordapp.com/avatars/${uid}/${session.user.avatar}.png?size=128`
    : null;

  // Progress to next tier
  const progress = tInfo.next && tInfo.nextMin
    ? Math.min(100, Math.round((totalSpent / tInfo.nextMin) * 100))
    : 100;

  return (
    <div className="px-4 pb-24 pt-4 max-w-xl mx-auto">

      {/* ── PROFILE CARD ── */}
      <div className="rounded-2xl p-4 mb-4" style={{ border: `1px solid ${tInfo.border}`, background: tInfo.bg }}>
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ border: `2px solid ${tInfo.color}` }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center font-black text-2xl" style={{ background: '#091828', color: tInfo.color }}>
                  {(session.user.name || session.user.discordName || 'U')[0].toUpperCase()}
                </div>
            }
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-black text-base text-white truncate">{session.user.name || session.user.discordName}</p>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-black border uppercase"
              style={{ color: tInfo.color, background: tInfo.bg, borderColor: tInfo.border }}>
              {tInfo.label}
            </span>
            <p className="text-sm mt-2" style={{ color: '#7bafd4' }}>
              SALDO: <span className="font-bold" style={{ color: '#60a5fa' }}>
                {formatIDR(user.balance || session.user.balance || 0)}
              </span>
            </p>
          </div>
        </div>

        {/* Progress to next tier */}
        {tInfo.next && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: '#7bafd4' }}>
              <span>Progress ke {tInfo.next}</span>
              <span>{formatIDR(totalSpent)} / {formatIDR(tInfo.nextMin)}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#0e2445' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: tInfo.color }} />
            </div>
          </div>
        )}

        {/* Separator */}
        <div className="border-t mb-4" style={{ borderColor: tInfo.border }} />

        {/* Stats */}
        <p className="font-bold text-xs text-white mb-3 tracking-wider">TOTAL TRANSAKSI</p>
        <div className="rounded-xl mb-3 py-3 text-center" style={{ border: `1px solid ${tInfo.border}` }}>
          <p className="text-3xl font-black text-white">{stats.total}</p>
          <p className="text-xs mt-0.5" style={{ color: '#7bafd4' }}>Total Transaksi</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Pending', val: stats.pending, color: '#f59e0b' },
            { label: 'Proses',  val: stats.proses,  color: '#60a5fa' },
            { label: 'Sukses',  val: stats.sukses,  color: '#10b981' },
            { label: 'Gagal',   val: stats.gagal,   color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="rounded-xl py-3 text-center" style={{ border: `1px solid ${tInfo.border}` }}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs mt-0.5" style={{ color: '#7bafd4' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIWAYAT TRANSAKSI ── */}
      <p className="font-black text-base text-white mb-3 tracking-wide">RIWAYAT TRANSAKSI</p>

      {orders.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ border: '1px solid #0e2445', background: '#091828' }}>
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm" style={{ color: '#7bafd4' }}>Belum ada transaksi</p>
          <Link href="/" className="text-sm font-bold mt-2 inline-block" style={{ color: '#1d6fff' }}>Belanja sekarang →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map(o => (
            <Link key={o.id} href={`/orders/${o.id}`}
              className="rounded-xl p-3 flex items-center justify-between gap-3 transition-all"
              style={{ border: '1px solid #0e2445', background: '#091828', textDecoration: 'none', color: 'inherit' }}>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-white truncate">{o.product_name || 'Produk'}</p>
                {o.variant_name && <p className="text-xs mt-0.5 truncate" style={{ color: '#7bafd4' }}>{o.variant_name}</p>}
                <p className="text-xs mt-1" style={{ color: '#3d5a7a' }}>{timeAgo(o.created_at)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-xs" style={{ color: '#60a5fa' }}>{formatIDR(o.total_amount)}</p>
                <span className="text-xs font-bold" style={{ color: statusColor[o.status] || '#7bafd4' }}>
                  {statusLabel[o.status] || o.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
