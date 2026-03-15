import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatIDR, timeAgo } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

export const metadata = { title: 'Pesanan Saya' };

const statusLabel = {
  pending: 'Menunggu Bayar', paid: 'Dibayar',
  processing: 'Diproses', completed: 'Selesai',
  failed: 'Gagal', cancelled: 'Dibatalkan',
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.discordId) redirect('/login?next=/orders');

  const { data: orders } = await supabaseAdmin.from('orders')
    .select('id,product_name,variant_name,total_amount,status,delivery_type,created_at')
    .eq('discord_id', session.user.discordId)
    .order('created_at', { ascending: false }).limit(50);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-6">Pesanan Saya</h1>
      {(!orders || !orders.length)
        ? <div className="text-center py-16 text-muted"><p className="text-4xl mb-3">📭</p><p>Belum ada pesanan.</p><Link href="/" className="text-accent-light text-sm mt-3 inline-block">Lihat Produk</Link></div>
        : <div className="space-y-3">
          {orders.map(o => (
            <Link key={o.id} href={`/orders/${o.id}`}
              className="block bg-card border border-border hover:border-accent/30 rounded-2xl p-4 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm">{o.product_name}</p>
                  <p className="text-xs text-muted">{o.variant_name} · {timeAgo(o.created_at)}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <Badge status={o.status}>{statusLabel[o.status]}</Badge>
                  <p className="text-sm font-bold text-accent-light">{formatIDR(o.total_amount)}</p>
                </div>
              </div>
              <p className="text-xs text-muted mt-2 font-mono">{o.id}</p>
            </Link>
          ))}
        </div>
      }
    </div>
  );
}
