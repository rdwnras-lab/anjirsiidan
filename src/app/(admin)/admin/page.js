import { supabaseAdmin } from '@/lib/supabase';
import { formatIDR } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export const metadata = { title: 'Admin Dashboard' };

async function getStats() {
  const today = new Date().toISOString().slice(0, 10);
  const [orders, todayOrders, products, keys] = await Promise.all([
    supabaseAdmin.from('orders').select('status,total_amount'),
    supabaseAdmin.from('orders').select('total_amount,status').gte('created_at', today),
    supabaseAdmin.from('products').select('id', { count: 'exact' }),
    supabaseAdmin.from('product_keys').select('is_used', { count: 'exact' }).eq('is_used', false),
  ]);
  const all    = orders.data || [];
  const done   = all.filter(o => o.status === 'completed');
  const revenue = done.reduce((s, o) => s + o.total_amount, 0);
  const todayRevenue = (todayOrders.data || []).filter(o=>o.status==='completed').reduce((s,o)=>s+o.total_amount,0);
  return {
    totalOrders:  all.length,
    completedOrders: done.length,
    revenue,
    todayRevenue,
    products: products.count || 0,
    stockKeys: keys.count || 0,
    recentOrders: (orders.data || []).slice(-10).reverse(),
  };
}

const statusLabel = { pending:'Menunggu', paid:'Dibayar', processing:'Diproses', completed:'Selesai', failed:'Gagal', cancelled:'Batal' };

export default async function AdminDashboard() {
  const s = await getStats();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold mb-6">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatIDR(s.revenue), icon: '💰', sub: `Hari ini: ${formatIDR(s.todayRevenue)}` },
          { label: 'Total Pesanan', value: s.totalOrders, icon: '🧾', sub: `${s.completedOrders} selesai` },
          { label: 'Produk Aktif', value: s.products, icon: '📦', sub: 'Semua produk' },
          { label: 'Stok Tersedia', value: s.stockKeys, icon: '🔑', sub: 'Key otomatis' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-extrabold mb-0.5">{stat.value}</div>
            <div className="text-xs text-muted">{stat.label}</div>
            <div className="text-xs text-dim mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Tambah Produk',   href: '/admin/products/new',  icon: '➕' },
          { label: 'Kelola Kategori', href: '/admin/categories',    icon: '🏷️' },
          { label: 'Pesanan Baru',    href: '/admin/orders',        icon: '🧾' },
          { label: 'Tambah Stok',     href: '/admin/products',      icon: '🔑' },
        ].map(l => (
          <Link key={l.href} href={l.href}
            className="bg-card border border-border hover:border-accent/40 rounded-xl p-4 text-center text-sm font-semibold transition-colors">
            <div className="text-2xl mb-1">{l.icon}</div>{l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
