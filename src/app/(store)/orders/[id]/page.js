import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { formatIDR } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export const metadata = { title: 'Detail Pesanan' };

const statusLabel = {
  pending:    'Menunggu Bayar',
  paid:       'Dibayar',
  processing: 'Diproses Admin',
  completed:  'Selesai',
  failed:     'Gagal',
  cancelled:  'Dibatalkan',
};

export default async function OrderDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  const { data: order } = await supabaseAdmin.from('orders')
    .select('*, order_keys(key_content)').eq('id', params.id).single();
  if (!order) notFound();

  // For auto orders: only the buyer can see keys (security)
  const canSeeKeys = order.delivery_type === 'manual' ||
    (session?.user?.discordId && order.discord_id === session.user.discordId);

  const formEntries = Object.entries(order.form_data || {}).filter(([k]) => !['name','whatsapp'].includes(k));

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/orders" className="text-sm text-dim hover:text-text">&larr; Pesanan Saya</Link>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-4">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-xs text-muted mb-1">Order ID</p>
            <p className="font-mono font-bold">{order.id}</p>
          </div>
          <Badge status={order.status}>{statusLabel[order.status] || order.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-5">
          <div><p className="text-muted mb-0.5">Produk</p><p className="font-semibold">{order.product_name}</p></div>
          <div><p className="text-muted mb-0.5">Varian</p><p className="font-semibold">{order.variant_name}</p></div>
          <div><p className="text-muted mb-0.5">Harga</p><p className="font-semibold">{formatIDR(order.base_amount)}</p></div>
          <div><p className="text-muted mb-0.5">Biaya QRIS</p><p className="font-semibold">+{formatIDR(order.fee_amount)}</p></div>
          <div><p className="text-muted mb-0.5">Total Bayar</p><p className="font-bold text-accent-light">{formatIDR(order.total_amount)}</p></div>
          <div><p className="text-muted mb-0.5">Tipe</p><p>{order.delivery_type === 'auto' ? '⚡ Otomatis' : '👤 Manual'}</p></div>
        </div>

        {formEntries.length > 0 && (
          <div className="border-t border-border pt-4 mb-4">
            <p className="text-xs text-muted uppercase font-semibold tracking-wider mb-3">Info Pesanan</p>
            {formEntries.map(([k, v]) => (
              <div key={k} className="flex gap-4 text-sm mb-1">
                <span className="text-muted w-32">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivered Keys */}
      {order.status === 'completed' && order.order_keys?.length > 0 && (
        <div className="bg-card border border-success/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-success text-xl">✅</span>
            <h2 className="font-bold">Produk Kamu</h2>
          </div>
          {canSeeKeys ? (
            <div className="space-y-3">
              {order.order_keys.map((ok, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-xs text-muted mb-2">Item {i+1}</p>
                  <pre className="text-sm text-accent-light font-mono whitespace-pre-wrap break-all">{ok.key_content}</pre>
                </div>
              ))}
              <p className="text-xs text-muted mt-2">⚠️ Simpan kode ini. Jangan bagikan kepada siapapun.</p>
              {order.discord_id && (
                <p className="text-xs text-success">✉️ Kode ini juga sudah dikirim via Discord DM.</p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-dim text-sm mb-3">Login dengan akun Discord yang digunakan saat memesan untuk melihat isi pesanan.</p>
              <button onClick={() => signIn('discord')} className="bg-[#5865F2] text-white text-sm px-4 py-2 rounded-xl font-semibold">Login Discord</button>
            </div>
          )}
        </div>
      )}

      {/* Manual: waiting notice */}
      {order.delivery_type === 'manual' && order.status === 'processing' && (
        <div className="bg-card border border-gold/30 rounded-2xl p-6 text-center">
          <p className="text-gold text-xl mb-2">⏳</p>
          <h3 className="font-bold mb-1">Pesanan Sedang Diproses</h3>
          <p className="text-dim text-sm">Admin kami akan menghubungi kamu dalam 1×24 jam.</p>
          {order.customer_whatsapp && (
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=Halo, saya mau konfirmasi pesanan ${order.id}`}
               target="_blank" rel="noreferrer"
               className="inline-block mt-4 bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 text-sm font-semibold px-4 py-2 rounded-xl">
              Chat WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}
