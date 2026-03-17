export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatIDR, timeAgo } from '@/lib/utils';
import TransactionSearch from './TransactionSearch';

const statusStyle = {
  pending:    { bg:'rgba(245,158,11,0.12)', color:'#fbbf24', border:'rgba(245,158,11,0.3)', label:'Menunggu' },
  paid:       { bg:'rgba(96,165,250,0.12)', color:'#60a5fa', border:'rgba(96,165,250,0.3)', label:'Dibayar' },
  processing: { bg:'rgba(167,139,250,0.12)', color:'#a78bfa', border:'rgba(167,139,250,0.3)', label:'Diproses' },
  completed:  { bg:'rgba(16,185,129,0.12)', color:'#10b981', border:'rgba(16,185,129,0.3)', label:'Selesai' },
  failed:     { bg:'rgba(239,68,68,0.12)', color:'#ef4444', border:'rgba(239,68,68,0.3)', label:'Gagal' },
  cancelled:  { bg:'rgba(75,85,99,0.12)', color:'#9ca3af', border:'rgba(75,85,99,0.3)', label:'Batal' },
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.discordId) redirect('/login');

  // Transaksi user ini
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, status, total_amount, created_at, product_name, variant_name')
    .eq('discord_id', session.user.discordId)
    .order('created_at', { ascending: false })
    .limit(50);

  // 10 transaksi sukses terbaru semua user (realtime, tanpa data sensitif)
  const { data: recentAll } = await supabaseAdmin
    .from('orders')
    .select('id, product_name, total_amount, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="px-4 pb-24 pt-4 max-w-xl mx-auto">
      <h1 className="font-black text-xl text-white mb-1 tracking-wide">TRANSACTION</h1>
      <p className="text-xs mb-5" style={{color:'#7bafd4'}}>Lacak dan kelola transaksimu</p>

      {/* Cek transaksi by invoice */}
      <TransactionSearch />

      {/* Realtime 10 transaksi sukses (semua user, anonymized) */}
      {recentAll && recentAll.length > 0 && (
        <div className="rounded-2xl overflow-hidden mt-4 mb-5" style={{border:'1px solid #0e2445', background:'#091828'}}>
          <div className="px-4 py-3 border-b" style={{borderColor:'#0e2445'}}>
            <p className="font-bold text-sm text-white">⚡ Transaksi Real-Time</p>
            <p className="text-xs mt-0.5" style={{color:'#7bafd4'}}>10 transaksi sukses terakhir yang baru masuk</p>
          </div>
          <div className="divide-y" style={{borderColor:'#0e2445'}}>
            {recentAll.map(o => (
              <div key={o.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{o.product_name}</p>
                  <p className="text-xs mt-0.5" style={{color:'#3d5a7a'}}>{timeAgo(o.created_at)}</p>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="text-xs font-bold" style={{color:'#10b981'}}>{formatIDR(o.total_amount)}</p>
                  <p className="text-xs" style={{color:'#10b981'}}>✓ Sukses</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat transaksi milik user ini */}
      <p className="font-bold text-sm text-white mb-3 tracking-wider">RIWAYAT TRANSAKSI</p>
      {(!orders || orders.length === 0) ? (
        <div className="text-center py-12 rounded-2xl" style={{border:'1px solid #0e2445', background:'#091828'}}>
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm" style={{color:'#7bafd4'}}>Belum ada transaksi</p>
          <Link href="/" className="text-sm font-bold mt-2 inline-block" style={{color:'#1d6fff'}}>
            Belanja sekarang →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map(o => {
            const st = statusStyle[o.status] || statusStyle.pending;
            return (
              <Link key={o.id} href={`/orders/${o.id}`}
                className="rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all"
                style={{border:'1px solid #0e2445', background:'#091828', textDecoration:'none', color:'inherit'}}>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-white truncate">{o.product_name}</p>
                  {o.variant_name && (
                    <p className="text-xs mt-0.5 truncate" style={{color:'#7bafd4'}}>{o.variant_name}</p>
                  )}
                  <p className="text-xs mt-1 font-mono" style={{color:'#3d5a7a'}}>{o.id}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-xs mb-1" style={{color:'#60a5fa'}}>{formatIDR(o.total_amount)}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                    style={{background: st.bg, color: st.color, borderColor: st.border}}>
                    {st.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
