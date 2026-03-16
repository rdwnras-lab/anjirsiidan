export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { formatIDR, timeAgo } from '@/lib/utils';
import AdminOrderActions from './AdminOrderActions';

const statusStyle = {
  pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failed:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
const statusLabel = { pending:'Menunggu', paid:'Dibayar', processing:'Diproses', completed:'Selesai', failed:'Gagal', cancelled:'Batal' };

export default async function AdminOrdersPage() {
  const { data: orders } = await supabaseAdmin
    .from('orders').select('*').order('created_at', { ascending: false }).limit(100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pesanan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{orders?.length || 0} total pesanan</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Produk</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Customer</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Waktu</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 dark:text-gray-600">
                    <p className="text-3xl mb-2">🧾</p>
                    <p>Belum ada pesanan</p>
                  </td>
                </tr>
              )}
              {(orders || []).map(o => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{o.id?.slice(0,8)}…</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate max-w-[160px]">{o.product_name || '—'}</p>
                    {o.variant_name && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{o.variant_name}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[130px]">{o.customer_name || o.user_name || o.discord_id || '—'}</p>
                    {o.customer_whatsapp && <p className="text-xs text-gray-400 mt-0.5">{o.customer_whatsapp}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-white whitespace-nowrap">
                    {formatIDR(o.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[o.status] || statusStyle.pending}`}>
                      {statusLabel[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 hidden lg:table-cell whitespace-nowrap">
                    {timeAgo(o.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminOrderActions order={o} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
