export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { formatIDR, timeAgo } from '@/lib/utils';
import Link from 'next/link';

const statusColor = {
  pending:'#f59e0b', paid:'#60a5fa', processing:'#a78bfa',
  completed:'#10b981', failed:'#ef4444', cancelled:'#6b7280',
};
const statusLabel = {
  pending:'Menunggu', paid:'Dibayar', processing:'Diproses',
  completed:'Selesai', failed:'Gagal', cancelled:'Batal',
};
// tierInfo sekarang dari DB tier_settings — diambil di dalam komponen

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.discordId) redirect('/login');

  const discordId = session.user.discordId;

  const [{ data: user }, { data: orders }, { data: tierSettings }] = await Promise.all([
    supabaseAdmin.from('users').select('id, tier, balance, total_spent').eq('discord_id', discordId).single(),
    supabaseAdmin.from('orders').select('id, status, total_amount, created_at, product_name, variant_name')
      .eq('discord_id', discordId).order('created_at', { ascending: false }).limit(20),
    supabaseAdmin.from('tier_settings').select('*').eq('is_active', true).order('min_spent', { ascending: true }),
  ]);

  const orderList  = orders || [];
  const allTiers   = tierSettings || [];
  const tier       = (user?.tier || session.user.tier || 'member').toLowerCase();
  const totalSpent = user?.total_spent
    || orderList.filter(o => o.status === 'completed').reduce((s,o) => s + o.total_amount, 0);

  const stats = {
    total:   orderList.length,
    pending: orderList.filter(o => o.status === 'pending').length,
    proses:  orderList.filter(o => ['paid','processing'].includes(o.status)).length,
    sukses:  orderList.filter(o => o.status === 'completed').length,
    gagal:   orderList.filter(o => ['failed','cancelled'].includes(o.status)).length,
  };

  const avatarUrl = session.user.avatar
    ? `https://cdn.discordapp.com/avatars/${discordId}/${session.user.avatar}.png?size=128`
    : null;

  // Tier saat ini dari DB
  const currentTierData = allTiers.find(t => t.tier_name.toLowerCase() === tier);
  const currentColor    = currentTierData?.color || (tier === 'member' ? '#60a5fa' : '#fbbf24');
  const currentDiscount = currentTierData ? Math.round(parseFloat(currentTierData.discount) * 100) : 0;

  // Tier berikutnya (yang lebih tinggi dari sekarang)
  const nextTierData = allTiers.find(t => t.min_spent > (currentTierData?.min_spent || 0) && t.min_spent > totalSpent);
  const progressFill = nextTierData
    ? Math.min(100, Math.round((totalSpent / nextTierData.min_spent) * 100))
    : 100;

  // Untuk backward compat UI
  const tInfo = {
    color:  currentColor,
    bg:     `${currentColor}14`,
    border: `${currentColor}40`,
    label:  tier.toUpperCase(),
    next:   nextTierData?.tier_name.toUpperCase() || null,
    nextMin: nextTierData?.min_spent || null,
  };

  return (
    <div className="px-4 pb-24 pt-4 max-w-xl mx-auto">

      {/* Profile card */}
      <div className="rounded-2xl p-4 mb-4" style={{border:`1px solid ${tInfo.border}`, background:tInfo.bg}}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
            style={{border:`2px solid ${tInfo.color}`}}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center font-black text-2xl"
                  style={{background:'#091828', color:tInfo.color}}>
                  {(session.user.name || session.user.discordName || 'U')[0].toUpperCase()}
                </div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-base text-white truncate">
              {session.user.name || session.user.discordName}
            </p>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-black border uppercase"
              style={{color:tInfo.color, background:tInfo.bg, borderColor:tInfo.border}}>
              {tInfo.label}
            </span>
            <p className="text-sm mt-2" style={{color:'#7bafd4'}}>
              SALDO: <span className="font-bold" style={{color:'#60a5fa'}}>
                {formatIDR(user?.balance || session.user.balance || 0)}
              </span>
            </p>
            {currentDiscount > 0 && (
              <p className="text-xs mt-1" style={{color:'#10b981'}}>
                Diskon member: <strong>{currentDiscount}% OFF</strong>
              </p>
            )}
          </div>
        </div>

        {/* Progress ke tier berikutnya — Rp + transaksi */}
        {tInfo.next && (
          <div className="mb-4 rounded-xl p-3" style={{background:'rgba(0,0,0,0.2)', border:`1px solid ${tInfo.border}`}}>
            <p className="text-xs font-bold text-white mb-2">
              Progress ke <span style={{color:tInfo.color}}>{tInfo.next}</span>
            </p>

            {/* Progress Total Belanja saja */}
            <div>
              <div className="flex justify-between text-xs mb-1" style={{color:'#7bafd4'}}>
                <span>Total Belanja</span>
                <span>{formatIDR(totalSpent)} / {formatIDR(tInfo.nextMin)}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{background:'#0e2445'}}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{width:`${progressFill}%`, background:`linear-gradient(90deg, ${tInfo.color}, #1d6fff)`}} />
              </div>
            </div>

            <p className="text-xs mt-2 text-center" style={{color:'#3d5a7a'}}>
              Belanja {formatIDR((tInfo.nextMin||0) - totalSpent)} lagi untuk naik ke {tInfo.next}
            </p>
          </div>
        )}

        <div className="border-t mb-4" style={{borderColor:tInfo.border}} />

        {/* Stats */}
        <p className="font-bold text-xs text-white mb-3 tracking-wider">TOTAL TRANSAKSI</p>
        <div className="rounded-xl mb-3 py-3 text-center" style={{border:`1px solid ${tInfo.border}`}}>
          <p className="text-3xl font-black text-white">{stats.total}</p>
          <p className="text-xs mt-0.5" style={{color:'#7bafd4'}}>Total Transaksi</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label:'Pending', val:stats.pending, color:'#f59e0b' },
            { label:'Proses',  val:stats.proses,  color:'#60a5fa' },
            { label:'Sukses',  val:stats.sukses,  color:'#10b981' },
            { label:'Gagal',   val:stats.gagal,   color:'#ef4444' },
          ].map(s => (
            <div key={s.label} className="rounded-xl py-3 text-center"
              style={{border:`1px solid ${tInfo.border}`}}>
              <p className="text-2xl font-black" style={{color:s.color}}>{s.val}</p>
              <p className="text-xs mt-0.5" style={{color:'#7bafd4'}}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Riwayat transaksi */}
      <p className="font-black text-base text-white mb-3 tracking-wide">RIWAYAT TRANSAKSI</p>
      {orderList.length === 0 ? (
        <div className="text-center py-12 rounded-2xl"
          style={{border:'1px solid #0e2445', background:'#091828'}}>
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm" style={{color:'#7bafd4'}}>Belum ada transaksi</p>
          <Link href="/" className="text-sm font-bold mt-2 inline-block" style={{color:'#1d6fff'}}>
            Belanja sekarang →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {orderList.map(o => (
            <Link key={o.id} href={`/orders/${o.id}`}
              className="rounded-xl p-3 flex items-center justify-between gap-3"
              style={{border:'1px solid #0e2445', background:'#091828', textDecoration:'none', color:'inherit'}}>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-white truncate">{o.product_name || 'Produk'}</p>
                {o.variant_name && (
                  <p className="text-xs mt-0.5 truncate" style={{color:'#7bafd4'}}>{o.variant_name}</p>
                )}
                <p className="text-xs mt-1" style={{color:'#3d5a7a'}}>{timeAgo(o.created_at)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-xs" style={{color:'#60a5fa'}}>{formatIDR(o.total_amount)}</p>
                <span className="text-xs font-bold" style={{color: statusColor[o.status] || '#7bafd4'}}>
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