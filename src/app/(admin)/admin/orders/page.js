import { supabaseAdmin } from '@/lib/supabase';
import { formatIDR, timeAgo } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import AdminOrderActions from './AdminOrderActions';

export const metadata = { title: 'Pesanan' };

const statusLabel = { pending:'Menunggu Bayar', paid:'Dibayar', processing:'Diproses', completed:'Selesai', failed:'Gagal', cancelled:'Dibatalkan' };

export default async function AdminOrdersPage() {
  const { data: orders } = await supabaseAdmin.from('orders')
    .select('*, order_keys(key_content)')
    .order('created_at', { ascending: false }).limit(100);

  return (
    <div className="p-6">
      <h1 className="text-xl font-extrabold mb-6">Pesanan</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted text-xs font-semibold uppercase tracking-wider">
              <th className="pb-3 pr-4">Order ID</th>
              <th className="pb-3 pr-4">Produk</th>
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Total</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Waktu</th>
              <th className="pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(orders || []).map(o => (
              <tr key={o.id} className="border-b border-border/50 hover:bg-card/50">
                <td className="py-3 pr-4 font-mono text-xs">{o.id}</td>
                <td className="py-3 pr-4">
                  <p className="font-semibold">{o.product_name}</p>
                  <p className="text-muted text-xs">{o.variant_name}</p>
                </td>
                <td className="py-3 pr-4">
                  <p className="text-xs">{o.customer_name || o.discord_id || '—'}</p>
                  {o.customer_whatsapp && <p className="text-xs text-muted">{o.customer_whatsapp}</p>}
                </td>
                <td className="py-3 pr-4 font-bold text-accent-light">{formatIDR(o.total_amount)}</td>
                <td className="py-3 pr-4"><Badge status={o.status}>{statusLabel[o.status]}</Badge></td>
                <td className="py-3 pr-4 text-muted text-xs">{timeAgo(o.created_at)}</td>
                <td className="py-3"><AdminOrderActions order={o} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
