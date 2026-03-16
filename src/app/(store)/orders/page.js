export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatIDR, timeAgo } from '@/lib/utils';
import TransactionSearch from './TransactionSearch';

const statusColor = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  paid:       'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  completed:  'bg-green-100 text-green-700 border-green-200',
  failed:     'bg-red-100 text-red-700 border-red-200',
  cancelled:  'bg-gray-100 text-gray-600 border-gray-200',
};
const statusLabel = {
  pending:'Menunggu', paid:'Dibayar', processing:'Diproses',
  completed:'Selesai', failed:'Gagal', cancelled:'Batal',
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.discordId) redirect('/login');

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, status, total_amount, created_at, product_name, variant_name')
    .eq('user_id', session.user.discordId)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="px-4 pb-24 pt-4 max-w-xl mx-auto">
      <h1 className="font-black text-xl text-white mb-4 tracking-wide">TRANSACTION</h1>

      {/* Search by invoice */}
      <TransactionSearch />

      {/* Order list */}
      <div className="mt-5">
        <p className="font-bold text-sm text-white mb-3 tracking-wider">RIWAYAT TRANSAKSI</p>
        {(!orders || orders.length === 0) ? (
          <div className="text-center py-12 rounded-2xl" style={{border:'1px solid #0e2445', background:'#091828'}}>
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm" style={{color:'#7bafd4'}}>Belum ada transaksi</p>
            <Link href="/" className="text-sm font-bold mt-2 inline-block" style={{color:'#1d6fff'}}>Belanja sekarang →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.map(o => (
              <Link key={o.id} href={`/orders/${o.id}`}
                className="rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all"
                style={{border:'1px solid #0e2445', background:'#091828', textDecoration:'none', color:'inherit'}}>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-white truncate">{o.product_name || 'Produk'}</p>
                  {o.variant_name && <p className="text-xs mt-0.5 truncate" style={{color:'#7bafd4'}}>{o.variant_name}</p>}
                  <p className="text-xs mt-1 font-mono" style={{color:'#3d5a7a'}}>{o.id}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-xs mb-1" style={{color:'#60a5fa'}}>{formatIDR(o.total_amount)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor[o.status] || statusColor.pending}`}>
                    {statusLabel[o.status] || o.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
