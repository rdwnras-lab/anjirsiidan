import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import CheckoutClient from './CheckoutClient';

export const metadata = { title: 'Pembayaran' };

export default async function CheckoutPage({ params }) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, products(thumbnail, banner_image), payment_methods(*)')
    .eq('id', params.orderId)
    .single();

  if (!order) notFound();

  if (order.status === 'completed') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold mb-2">Sudah Dibayar</h1>
        <p className="text-dim text-sm">Pesanan ini sudah selesai.</p>
        <a href={`/orders/${params.orderId}`} className="inline-block mt-6 text-accent-light underline text-sm">Lihat Detail</a>
      </div>
    );
  }

  return <CheckoutClient order={order} />;
}