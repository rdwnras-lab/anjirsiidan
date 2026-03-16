export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { formatIDR } from '@/lib/utils';
import Link from 'next/link';

async function getStats() {
  const today = new Date().toISOString().slice(0, 10);
  const [ordersRes, todayRes, prodsRes, keysRes, usersRes] = await Promise.all([
    supabaseAdmin.from('orders').select('status,total_amount'),
    supabaseAdmin.from('orders').select('total_amount,status').gte('created_at', today),
    supabaseAdmin.from('products').select('id,is_active', { count: 'exact' }),
    supabaseAdmin.from('product_keys').select('is_used', { count: 'exact' }).eq('is_used', false),
    supabaseAdmin.from('users').select('id', { count: 'exact' }),
  ]);

  const all      = ordersRes.data || [];
  const done     = all.filter(o => o.status === 'completed');
  const pending  = all.filter(o => o.status === 'pending');
  const revenue  = done.reduce((s, o) => s + (o.total_amount || 0), 0);
  const todayRev = (todayRes.data || []).filter(o => o.status === 'completed').reduce((s, o) => s + (o.total_amount || 0), 0);
  const { data: recentOrders } = await supabaseAdmin
    .from('orders')
    .select('id, product_name, variant_name, total_amount, status, created_at, user_name')
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    revenue, todayRev,
    totalOrders: all.length,
    completedOrders: done.length,
    pendingOrders: pending.length,
    products: prodsRes.count || 0,
    stockKeys: keysRes.count || 0,
    users: usersRes.count || 0,
    recentOrders: recentOrders || [],
  };
}

const statusColor = {
  pending: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
  paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
  failed: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};
const statusLabel = { pending:'Menunggu', paid:'Dibayar', processing:'Diproses', completed:'Selesai', failed:'Gagal', cancelled:'Batal' };

export default async function AdminDashboard() {
  const s = await getStats();

  const metricCards = [
    { label: 'Total Revenue', value: formatIDR(s.revenue), sub: `Hari ini: ${formatIDR(s.todayRev)}`, icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Pesanan', value: s.totalOrders, sub: `${s.completedOrders} selesai · ${s.pendingOrders} pending`, icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Produk Aktif', value: s.products, sub: 'Semua produk di toko', icon: 'M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-9 11H7v-2h4v2zm6 0h-4v-2h4v2zm0-4H7v-2h10v2zM4 5h16V3H4v2z', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Stok Keys', value: s.stockKeys, sub: 'Key otomatis tersedia', icon: 'M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Selamat datang di panel admin Vechnost</p>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">{new Date().toLocaleDateString('id-ID', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {metricCards.map(card => (
          <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${card.bg}`}>
              <svg className={`w-6 h-6 ${card.color}`} viewBox="0 0 24 24" fill="currentColor">
                <path d={card.icon}/>
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tambah Produk', href: '/admin/products/new', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
            { label: 'Kelola Kategori', href: '/admin/categories', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
            { label: 'Lihat Pesanan', href: '/admin/orders', color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
            { label: 'Tambah Banner', href: '/admin/banners', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className={`rounded-xl p-4 text-center text-sm font-semibold transition-all hover:opacity-80 ${a.color}`}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 dark:text-white">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Lihat semua →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left pb-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Produk</th>
                <th className="text-left pb-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Pembeli</th>
                <th className="text-right pb-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                <th className="text-right pb-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {s.recentOrders.length === 0 && (
                <tr><td colSpan="4" className="py-8 text-center text-gray-400">Belum ada pesanan</td></tr>
              )}
              {s.recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-800 dark:text-white truncate max-w-[160px]">{o.product_name || 'Produk'}</p>
                    {o.variant_name && <p className="text-xs text-gray-400 truncate">{o.variant_name}</p>}
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <p className="text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{o.user_name || '-'}</p>
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                    {formatIDR(o.total_amount)}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[o.status] || statusColor.pending}`}>
                      {statusLabel[o.status] || o.status}
                    </span>
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
