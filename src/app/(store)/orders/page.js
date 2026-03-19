export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { formatIDR, timeAgo } from '@/lib/utils';
import TransactionSearch from './TransactionSearch';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  // 10 transaksi sukses terbaru semua user
  const { data: recentAll } = await supabaseAdmin
    .from('orders')
    .select('id, product_name, total_amount, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="px-4 pb-24 pt-4 max-w-xl mx-auto">
      <h1 className="font-black text-xl text-white mb-1 tracking-wide">TRANSACTION</h1>
      <p className="text-xs mb-5" style={{color:'#7bafd4'}}>
        Lacak transaksimu dengan nomor invoice
      </p>

      {/* Cek transaksi by invoice */}
      <TransactionSearch />

      {/* Realtime transaksi — swipeable horizontal seperti hometopup */}
      {recentAll && recentAll.length > 0 && (
        <div className="mt-5">
          <p className="font-bold text-sm text-white mb-3 tracking-wider">⚡ TRANSAKSI REAL-TIME</p>
          <p className="text-xs mb-3" style={{color:'#7bafd4'}}>
            Berikut ini 10 transaksi terakhir yang baru saja masuk.
          </p>

          {/* Swipeable table */}
          <div className="rounded-2xl overflow-hidden" style={{border:'1px solid #0e2445'}}>
            {/* Header fixed */}
            <div className="grid text-xs font-bold uppercase px-4 py-2.5"
              style={{gridTemplateColumns:'160px 1fr 100px', background:'#050f1e', borderBottom:'1px solid #0e2445', color:'#3d5a7a'}}>
              <div>TANGGAL</div>
              <div>PRODUK</div>
              <div className="text-right">HARGA</div>
            </div>

            {/* Rows — scrollable horizontal on mobile */}
            <div className="overflow-x-auto" style={{background:'#091828'}}>
              <div style={{minWidth:'400px'}}>
                {recentAll.map((o, i) => (
                  <div key={o.id}
                    className="grid px-4 py-3 text-xs items-center"
                    style={{
                      gridTemplateColumns:'160px 1fr 100px',
                      borderTop: i > 0 ? '1px solid #0e2445' : 'none',
                    }}>
                    <div style={{color:'#7bafd4'}}>
                      {new Date(o.created_at).toLocaleDateString('id-ID', {
                        day:'numeric', month:'long', year:'numeric'
                      })}
                    </div>
                    <div className="font-semibold text-white truncate pr-4">{o.product_name}</div>
                    <div className="text-right font-bold" style={{color:'#10b981'}}>
                      {formatIDR(o.total_amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-center mt-2" style={{color:'#3d5a7a'}}>
            Geser ke kanan untuk melihat detail
          </p>
        </div>
      )}
    </div>
  );
}